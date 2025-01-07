import flask
import collage
from flask_jwt_extended import jwt_required
from firebase_admin import storage
from sklearn.feature_extraction.text import TfidfVectorizer
from collage.server.pdf_parser import extract_text_from_pdf


def extract_keywords_from_resume(file_path):
    """
    Extract keywords from a resume PDF using PyPDF2 and TF-IDF.

    Args:
        file_path (str): Path to the resume PDF.

    Returns:
        list: List of extracted keywords.
    """
    # Extract text from the PDF
    text = extract_text_from_pdf(file_path)

    if not text.strip():
        raise ValueError("No text could be extracted from the PDF.")

    vectorizer = TfidfVectorizer(max_features=30, stop_words='english')
    tfidf_matrix = vectorizer.fit_transform([text])
    feature_names = vectorizer.get_feature_names_out()

    # Use the TF-IDF scores to sort keywords
    # Get scores for the single document
    tfidf_scores = tfidf_matrix.toarray()[0]
    keywords_with_scores = sorted(
        zip(feature_names, tfidf_scores),
        key=lambda x: x[1],
        reverse=True
    )

    keywords = [word for word, score in keywords_with_scores]
    return keywords


def update_user_keywords():
    connection = collage.model.get_db()
    uid = flask.session['uid']

    with connection.cursor(dictionary=True) as cursor:
        cursor.execute(
            "SELECT * FROM user_keywords WHERE user_id = %s", (flask.session['user_id'],))
        user_keywords = cursor.fetchone()
        if user_keywords is None:
            # Fetch and parse the resume
            resume_path = f"users/{uid}/resume.pdf"
            bucket = storage.bucket("collage-849c3.appspot.com")
            blob = bucket.blob(resume_path)

            if not blob.exists():
                print("Warning: resume not found")
                return ""

            temp_path = f"/tmp/{uid}_resume.pdf"
            blob.download_to_filename(temp_path)

            user_keywords = extract_keywords_from_resume(temp_path)
            user_keywords = ','.join(user_keywords)

            cursor.execute(
                "INSERT INTO user_keywords (user_id, keywords) VALUES (%s, %s)",
                (flask.session['user_id'], user_keywords)
            )
            print(f"Success: inserted keywords: {user_keywords}")
            connection.commit()
            return user_keywords
        return user_keywords["keywords"]


def calculate_similarity(user_keywords, course_keywords):
    # Normalize to lowercase for case-insensitive matching
    user_keywords_set = {keyword.lower() for keyword in user_keywords}

    # Tokenize course keywords into words or subwords, and normalize to lowercase
    course_words = set()
    for phrase in course_keywords:
        words = phrase.lower().split()  # Convert to lowercase and split
        course_words.update(words)

    # Compute overlap with subword matching
    overlap = sum(1 for user_word in user_keywords_set if any(
        user_word in course_word for course_word in course_words))
    # total = len(user_keywords_set)

    if (overlap >= 2):
        return 1
    elif (overlap == 1):
        return 0.5
    else:
        return 0


@collage.app.route('/api/search/', methods=['POST'])
@jwt_required()
def search_with_filters():
    connection = collage.model.get_db()  # Open DB
    data = flask.request.get_json()
    user_major = data.get('user_major', '').lower()
    filters = data.get('filters', [])
    search_string = data.get('search_string', "").lower()

    # Build filters into the SQL query
    filter_class_conditions = []
    filter_credit_conditions = []

    for filter_item in filters:
        if filter_item.startswith('s'):  # Subject filter
            subject = filter_item[1:]
            filter_class_conditions.append(f"class_topic = '{subject}'")
        elif filter_item.startswith('c'):  # Credit hours filter
            credit_hour = filter_item[1:]
            credit_hour = int(credit_hour.split()[0])
            filter_credit_conditions.append(f"credit_hours = {credit_hour}")

    # Combine filter conditions
    class_clause = f"({' OR '.join(filter_class_conditions)
                       })" if filter_class_conditions else ""
    credit_clause = f"({' OR '.join(filter_credit_conditions)
                        })" if filter_credit_conditions else ""

    # Add search_string condition
    search_conditions = []
    if search_string:
        search_conditions.append(
            f"LOWER(c.course_code) LIKE '%{search_string}%'")
        search_conditions.append(
            f"LOWER(c.course_name) LIKE '%{search_string}%'")
        for i in range(1, 6):
            search_conditions.append(
                f"LOWER(c.tag_{i}) LIKE '%{search_string}%'")

    search_clause = f"({' OR '.join(search_conditions)
                        })" if search_conditions else ""

    # Combine all conditions
    where_conditions = []
    if class_clause:
        where_conditions.append(class_clause)
    if credit_clause:
        where_conditions.append(credit_clause)
    if search_clause:
        where_conditions.append(search_clause)

    where_clause = f"WHERE {' AND '.join(
        where_conditions)}" if where_conditions else ""

    # Query to retrieve course details along with the count of users who saved each course
    query = f"""
        SELECT
            c.course_id, c.course_code, c.credit_hours, c.course_name, c.class_topic, c.icon_url,
            c.total_rating, c.num_ratings, c.tag_1, c.tag_2, c.tag_3, c.tag_4, c.tag_5,
            COUNT(sc.user_id) AS save_count
        FROM courses c
        LEFT JOIN saved_courses sc ON c.course_id = sc.course_id
        {where_clause}
        GROUP BY c.course_id
    """

    final_agg = []

    with connection.cursor(dictionary=True) as cursor:
        cursor.execute(query)
        results = cursor.fetchall()

        with connection.cursor(dictionary=True) as cursor:
            user_keywords = update_user_keywords()
            if (user_keywords != ""):
                user_keywords = user_keywords.split(',')

        for item in results:
            # Extract course tags
            course_tags = [item[f'tag_{str(i)}'] for i in range(
                1, 6) if item[f'tag_{str(i)}']]
            item['tags'] = course_tags

            # Calculate average rating
            item['rating'] = 0
            if item['num_ratings'] != 0:
                item['rating'] = item['total_rating'] / item['num_ratings']

            # Calculate semantic match for tags
            semantic_score = calculate_similarity(user_keywords, course_tags)
            # if (semantic_score > 0):
            # print(f"Semantic score is greater than 0: {semantic_score}")
            # print(f"semantic score: {semantic_score}")

            # Normalize the number of saves
            max_saves = max([r['save_count']
                            for r in results]) if results else 1
            if max_saves > 0:
                save_score = item['save_count'] / max_saves
            else:
                save_score = 0

            semantic_weight = 0.5
            rating_weight = 0.3
            save_weight = 1 - semantic_weight - rating_weight
            # Combine semantic score, rating, and save score for percent match
            item['percent_match'] = round((
                semantic_weight * semantic_score +
                rating_weight * (item['rating'] / 5) +
                save_weight * save_score
            ) * 100)

            if item['credit_hours'] == 1:
                item['icon_color'] = '#F1D5A9'
                item['header_color'] = '#FFF9EF'
                item['credit_color'] = '#FFE6C1'
            elif item['credit_hours'] == 2:
                item['icon_color'] = '#7AAB85'
                item['header_color'] = '#E7FFEC'
                item['credit_color'] = '#B8FFC8'
            elif item['credit_hours'] == 3:
                item['icon_color'] = '#85A1EB'
                item['header_color'] = '#EFF4FF'
                item['credit_color'] = '#C2D7FE'
            elif item['credit_hours'] >= 4:
                item['icon_color'] = '#C55F5F'
                item['header_color'] = '#FFE8E8'
                item['credit_color'] = '#F79696'

            final_agg.append(item)

    final_agg.sort(key=lambda x: x['percent_match'], reverse=True)
    return flask.jsonify(results=final_agg), 200
