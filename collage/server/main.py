import os
import requests
import flask 
from flask import Flask, jsonify, request
import collage
from dotenv import load_dotenv
from datetime import datetime
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity
from flask_cors import CORS
# from collage.server.auth import auth
# from authlib.integrations.flask_client import OAuth
import io
from collage.server.recommend import recommend_classes
from collage.server.dalle import generate_image, format_prompt
from collage.server.nltk_utils import parse_resume

CORS(collage.app)
# Initialize JWTManager
collage.app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')  # Replace with your own secret key
collage.app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies', 'json']
jwt = JWTManager(collage.app)

load_dotenv()  # Load the environment variables from the .env file

GOOGLE_CLIENT_ID = os.environ['GOOGLE_CLIENT_ID']
GOOGLE_SECRET_KEY = os.environ['GOOGLE_SECRET_KEY']

def verify_user():
    """
        Ensures that the currently logged in user has completed their profile and has been added
        to the database. Should be called within any function that requires user information.
    """
    if flask.session['registered'] != True:
        return flask.jsonify(unregistered=True), 200


@collage.app.route('/api/', methods=['GET'])
def home():
    return flask.jsonify(working=True), 200


@collage.app.route('/api/login/', methods=['POST'])
def login():
    auth_code = flask.request.get_json()['code']
    if not flask.session.get('registered'):
        flask.session['registered'] = False
    data = {
        'code': auth_code,
        'client_id': GOOGLE_CLIENT_ID,  # client ID from the credential at google developer console
        'client_secret': GOOGLE_SECRET_KEY,  # client secret from the credential at google developer console
        'redirect_uri': 'postmessage',
        'grant_type': 'authorization_code'
    }

    response = requests.post('https://oauth2.googleapis.com/token', data=data).json()
    headers = {
        'Authorization': f'Bearer {response["access_token"]}'
    }
    user_info = requests.get('https://www.googleapis.com/oauth2/v3/userinfo', headers=headers).json()
    print(user_info)
    if 'hd' in user_info.keys():
        if user_info['hd'][-4:] == ".edu":
            """
                check here if user exists in database, if not, mark session user as unregistered, otherwise mark user as registered.
            """
            flask.session['current_user'] = user_info['email']
            flask.session['registered'] = False
            connection = collage.model.get_db()
            with connection.cursor(dictionary=True) as cursor:
                user_query = """
                            SELECT *
                            FROM users
                            WHERE email = %s
                        """
                cursor.execute(user_query, (user_info['email'],))
                result = cursor.fetchone()
                if result is None:
                    flask.session['registered'] = False
                else:
                    flask.session['registered'] = True
            jwt_token = create_access_token(identity=user_info['email'])  # create jwt token
            response = flask.jsonify(status="success", user=user_info, registered=flask.session['registered']) # change the response to whatever is needed for other frontend operations
            response.set_cookie('access_token', value=jwt_token, secure=True)
            return response, 200
    else:
        print("login_failure")
        return flask.jsonify(status="failed"), 200

@collage.app.route('/api/signup/', methods=['POST'])
#@jwt_required()
def signup():
    """
        Users will be redirected here after a successful login if the login endpoint
        includes an 'unregistered' flag in the response.
    """
    data = flask.request.get_json()
    connection = collage.model.get_db()
    with connection.cursor(dictionary=True) as cursor:
        insert_query = """
                    INSERT INTO users (email, full_name, start_year, graduation_year, enrollment_date,
                    credits_completed, keywords, major) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
        cursor.execute(insert_query, (flask.session['current_user'], data['full_name'], data['start_year'], data['graduation_year'],
                                      data['enrollment_date'], data['credits_completed'], data['temporary_keywords'], data['major']))
        flask.session['registered'] = True
    connection.commit()
    return flask.jsonify(registered=True), 200 # also send back any other needed information later


@collage.app.route('/api/logout/', methods=['POST'])
#@jwt_required()
def logout():
    #verify_user()
    flask.session['registered'] = False
    flask.session['current_user'] = None
    jwt_token = flask.request.cookies.get('access_token') # Demonstration how to get the cookie
    # current_user = get_jwt_identity()
    return flask.jsonify(registered=False), 200

@collage.app.route('/api/filters/', methods=['GET'])
#@jwt_required()
def get_filters():
    #verify_user()
    connection = collage.model.get_db()  # open db
    with connection.cursor(dictionary=True) as cursor:
        cursor.execute("""SELECT * FROM filters""")
        results = cursor.fetchall()
    response = []
    keys = {}
    counter = 0
    for result in results:
        if result['filter_cat'] not in keys:
            keys[result['filter_cat']] = counter
            counter += 1
            response.append({'category': result['filter_cat'], 'filters': []})
        response[keys[result['filter_cat']]]['filters'].append(result)
    for cat in response:
        cat['filters'] = sorted(cat['filters'], key=lambda x:x['filter_value'])
    return flask.jsonify(response), 200

@collage.app.route('/api/search/', methods=['POST'])
#@jwt_required()
def search_with_filters():
    # For now, topic description is the school
    # and course_description is keywords
    # major is under class topic
    #verify_user()
    colors = ["#C2D7FE", "#B8FFC8", "#C2D7FE", "#B8FFC8", "#FF7C7C", "#FFE6C1", "#FF7C7C", "#FFE6C1"]
    connection = collage.model.get_db()  # open db
    data = flask.request.get_json()
    with connection.cursor(dictionary=True) as cursor:
        cursor.execute("""SELECT subject_code, credit_hours, topic_description, course_name, course_description, class_topic, ai_img_url FROM courses""")
        results = cursor.fetchall()
    temp_results = []
    if data['search_string'] != '':
        for result in results:
            #if the search string appears in any of the relevant fields
            if data['search_string'] in result['subject_code'].lower() or data['search_string'].lower() in result['topic_description'] or data['search_string'].lower() in result['course_name'] or data['search_string'] in result['course_description'].lower() or data['search_string'] in result['class_topic'].lower():
                temp_results.append(result)
    else:
        temp_results = results
    data['filters'].sort()
    dupes = set()
    final = []
    for filter in data['filters']:
        actual = filter[1:]
        for temp in temp_results:
            if filter[0] == 's':
                if actual == temp['topic_description'] and temp['subject_code'] not in dupes:
                    final.append(temp)
                    dupes.add(temp['subject_code'])
            elif filter[0] == 'c':
                if int(actual) == temp['credit_hours'] and temp['subject_code'] not in dupes:
                    final.append(temp)
                    dupes.add(temp['subject_code'])
            elif filter[0] == 'm':
                if actual == temp['class_topic'] and temp['subject_code'] not in dupes:
                    final.append(temp)
                    dupes.add(temp['subject_code'])
    if len(data['filters']) == 0:
        final = temp_results
    counter = 0
    for result in final:
        result['color'] = colors[counter % 8]
        counter += 1
    return flask.jsonify(final), 200


@collage.app.route('/api/catalog/', methods=['POST'])
#@jwt_required()
def handle_catalog():
    #verify_user()
    connection = collage.model.get_db()  # open db
    # assume JSON data format is {'user_id": INT}
    data = flask.request.get_json()
    user_id = data['user_id']
    recommendations = recommend_classes(connection, user_id)

    # the user does not exist
    if recommendations == None:
        return flask.jsonify(
            {"status": "failure"}
        )

    recommendations = recommendations.to_dict(orient='records')

    for course in recommendations:
        course_id = course['course_id']

        with connection.cursor(dictionary=True) as cursor:
            course_info_query = """
                SELECT subject code, catalog_number,
                credit_hours, instructor_id, course_name,
                course_description, class_topic, ai_img_url
                FROM courses
                WHERE course_id = %s
            """
            cursor.execute(course_info_query, (course_id,))
            course = cursor.fetchone()
        course['course_id'] = course_id

        # check whether an AI image has been generated for that course
        if course['ai_img_url'] == None:
            prompt = format_prompt(course['course_description'], course['class_topic'])
            img_url = generate_image(
                model="dall-e-3",
                prompt=prompt
            )
            course['ai_img_url'] = img_url

            with connection.cursor(dictionary=True) as cursor:
                img_query = """
                    UPDATE courses
                    SET ai_img_url = %s
                    WHERE course_id = %s
                """
                cursor.execute(img_query, (img_url, course_id))
                connection.commit()

    # return the JSON of "a list of dictionaries"
    return flask.jsonify(recommendations)


@collage.app.route('/api/courses/<int:course_id>', methods=['POST'])
def course_backpack(course_id):
    op = flask.request.args.get('operation')
    user_id = flask.request.args.get('user_id')
    connection = collage.model.get_db()
    cursor = connection.cursor()

    if op == 'save':
        try:
            cursor.execute('''
                INSERT INTO saved_courses (user_id, course_id)
                VALUES (%s, %s)
            ''', (user_id, course_id))
            connection.commit()
            return flask.jsonify({'status': 'success', 'message': 'Course saved successfully'}), 200
        except Exception as e:
            connection.rollback()
            return flask.jsonify({'status': 'error', 'message': str(e)}), 500

    elif op == 'delete':
        try:
            cursor.execute('''
                DELETE FROM saved_courses
                WHERE user_id = %s AND course_id = %s
            ''', (user_id, course_id))
            connection.commit()
            return flask.jsonify({'status': 'success', 'message': 'Course removed successfully'}), 200
        except Exception as e:
            connection.rollback()
            return flask.jsonify({'status': 'error', 'message': str(e)}), 500

    else:
        return flask.jsonify({'status': 'error', 'message': 'Invalid operation'}), 400


@collage.app.route('/api/student/<int:user_id>', methods=['GET'])
#@jwt_required()
def get_user_stats(user_id):
    #verify_user()
    connection = collage.model.get_db()
    cursor = connection.cursor
    cursor.execute()

    follower_query = """
        SELECT COUNT(*) 
        AS follower_count
        FROM connections
        WHERE followed_id = %s
    """
    cursor.execute(follower_query, (user_id,))
    follower_count = cursor.fetchone()['follower_count']

    following_query = """
        SELECT COUNT(*) 
        AS following_count
        FROM connections
        WHERE follower_id = %s
    """
    cursor.execute(following_query, (user_id,))
    following_count = cursor.fetchone()['following_count']

    student_info_query = """
        SELECT graduation_year, start_year
        FROM users
        WHERE user_id = %s
    """
    cursor.execute(student_info_query, (user_id,))
    student_info = cursor.fetchone()['student_info']

    credits_completed_query = """
        SELECT credits_completed
        FROM users
        WHERE user_id = %s
    """
    cursor.execute(credits_completed_query, (user_id,))
    credits_completed = cursor.fetchone()['credits_completed']

    major_credits_query = """
        SELECT major_credits_required
        FROM users
        WHERE user_id = %s
    """
    cursor.execute(major_credits_query, (user_id,))
    credits_required = cursor.fetchone()['credits_required']

    connection.close()

    response = {
        'following_count': follower_count,
        'follower_count': following_count,
        'graduation_year': student_info['graduation_year'],
        'registration_term': student_info['start_year'],
        'credits_completed': credits_completed,
        'credits_required': credits_required
    }
    return flask.jsonify(response)


@collage.app.route('/api/search/classes/<string:search_string>/<int:user_id>/', methods=['POST'])
def search_classes(serach_string,user_id):
    #take things in as a json object
    search_params = flask.request.get_json()


@collage.app.route('/api/delete/', methods=['GET'])
def delete():
    conn = collage.model.get_db()

    # Create a cursor object
    cursor = conn.cursor()

    # Execute a query
    cursor.execute("DELETE FROM users WHERE email = %s", ('jadensun@umich.edu',))
    conn.commit()
    conn.close()

    return flask.jsonify({"flag": "success"})


@collage.app.route('/api/test/', methods=['GET'])
def test():
    conn = collage.model.get_db()

    # Create a cursor object
    cursor = conn.cursor()

    # Execute a query
    cursor.execute("SHOW TABLES")

    # Fetch and print results
    for table in cursor:
        print(table)

    return flask.jsonify({"flag": "success"})




#Return all followers for a given user.
@collage.app.route('/api/followers/<int:user_id>', methods=['GET'])
def get_followers(user_id):
    # MAKE SURE TO SET THE ...id NAME AS "id" SO THE NETWORK COMPONENT WORKS
    # connection = collage.model.get_db()
    # with connection.cursor(dictionary=True) as cursor:
    #     cursor.execute("""
    #         SELECT follower_id AS id
    #         FROM connections 
    #         WHERE followed_id = %s AND following_status = TRUE
    #     """, (user_id,))
    #     followers = cursor.fetchall()
    # return jsonify(followers), 200
    img_url = '../images/Charlie.svg'
    followers = [
        {
            "id": 1,
            "name": "Alice Smith",
            "username": "alice123",
            "profileImage": img_url,
            "major": "Computer Science",
            "gradYear": 2025,
            "followersCount": 120,
            "mutuals": ["John Doe", "Jane Doe"],
        },
        {
            "id": 2,
            "name": "Bob Johnson",
            "username": "bobJohn",
            "profileImage": img_url,
            "major": "Electrical Engineering",
            "gradYear": 2024,
            "followersCount": 80,
            "mutuals": ["Alice Smith", "Emily Davis"],
        },
        {
            "id": 3,
            "name": "Charlie Brown",
            "username": "charlie_0",
            "profileImage": img_url,
            "major": "Mechanical Engineering",
            "gradYear": 2023,
            "followersCount": 95,
            "mutuals": ["Bob Johnson", "Alice Smith"],
        },
    ]
    return flask.jsonify(followers), 200


#Return all users a given user is following.
@collage.app.route('/api/following/<int:user_id>', methods=['GET'])
def get_following(user_id):
    # connection = collage.model.get_db()
    # with connection.cursor(dictionary=True) as cursor:
    #     cursor.execute("""
    #         SELECT followed_id 
    #         FROM connections 
    #         WHERE follower_id = %s AND following_status = TRUE
    #     """, (user_id,))
    #     following = cursor.fetchall()
    # return jsonify(following), 200
    following = [
        {
            "id": 1,
            "name": "Alice Smith",
            "username": "alice123",
            "profileImage": "CharlieProfileImage",
            "major": "Computer Science",
            "gradYear": 2025,
            "followersCount": 120,
            "mutuals": ["John Doe", "Jane Doe"],
        },
        {
            "id": 2,
            "name": "Bob Johnson",
            "username": "bobJohn",
            "profileImage": "CharlieProfileImage",
            "major": "Electrical Engineering",
            "gradYear": 2024,
            "followersCount": 80,
            "mutuals": ["Alice Smith", "Emily Davis"],
        },
        {
            "id": 3,
            "name": "Charlie Brown",
            "username": "charlie_0",
            "profileImage": "CharlieProfileImage",
            "major": "Mechanical Engineering",
            "gradYear": 2023,
            "followersCount": 95,
            "mutuals": ["Bob Johnson", "Alice Smith"],
        },
    ]
    return jsonify(following), 200

#Return all follow requests a user has
@collage.app.route('/api/requests/<int:user_id>', methods=['GET'])
def get_requests(user_id):
    # connection = collage.model.get_db()
    # with connection.cursor(dictionary=True) as cursor:
    #     cursor.execute("""
    #         SELECT followed_id 
    #         FROM connections 
    #         WHERE follower_id = %s AND following_status = TRUE
    #     """, (user_id,))
    #     following = cursor.fetchall()
    # return jsonify(following), 200
    requests = [
        {
            "id": 1,
            "name": "Alice Smith",
            "username": "alice123",
            "profileImage": "CharlieProfileImage",
            "major": "Computer Science",
            "gradYear": 2025,
            "followersCount": 120,
            "mutuals": ["John Doe", "Jane Doe"],
        },
        {
            "id": 2,
            "name": "Bob Johnson",
            "username": "bobJohn",
            "profileImage": "CharlieProfileImage",
            "major": "Electrical Engineering",
            "gradYear": 2024,
            "followersCount": 80,
            "mutuals": ["Alice Smith", "Emily Davis"],
        },
        {
            "id": 3,
            "name": "Charlie Brown",
            "username": "charlie_0",
            "profileImage": "CharlieProfileImage",
            "major": "Mechanical Engineering",
            "gradYear": 2023,
            "followersCount": 95,
            "mutuals": ["Bob Johnson", "Alice Smith"],
        },
    ]
    return jsonify(requests), 200

#Return all suggested connections a user gets
@collage.app.route('/api/connects/<int:user_id>', methods=['GET'])
def get_connects(user_id):
    # connection = collage.model.get_db()
    # with connection.cursor(dictionary=True) as cursor:
    #     cursor.execute("""
    #         SELECT followed_id 
    #         FROM connections 
    #         WHERE follower_id = %s AND following_status = TRUE
    #     """, (user_id,))
    #     following = cursor.fetchall()
    # return jsonify(following), 200
    connects = [
        {
            "id": 1,
            "name": "Alice Smith",
            "username": "alice123",
            "profileImage": "CharlieProfileImage",
            "major": "Computer Science",
            "gradYear": 2025,
            "followersCount": 120,
            "mutuals": ["John Doe", "Jane Doe"],
        },
        {
            "id": 2,
            "name": "Bob Johnson",
            "username": "bobJohn",
            "profileImage": "CharlieProfileImage",
            "major": "Electrical Engineering",
            "gradYear": 2024,
            "followersCount": 80,
            "mutuals": ["Alice Smith", "Emily Davis"],
        },
        {
            "id": 3,
            "name": "Charlie Brown",
            "username": "charlie_0",
            "profileImage": "CharlieProfileImage",
            "major": "Mechanical Engineering",
            "gradYear": 2023,
            "followersCount": 95,
            "mutuals": ["Bob Johnson", "Alice Smith"],
        },
    ]
    return jsonify(connects), 200

#Follow a user by adding an entry in the connections table.
@collage.app.route('/api/follow', methods=['POST'])
def follow_user():
    # data = request.get_json()
    # follower_id = data['user_id']
    # followed_id = data['follow_id']
    # connection = collage.model.get_db()
    # try:
    #     with connection.cursor(dictionary=True) as cursor:
    #         cursor.execute("""
    #             INSERT INTO connections (follower_id, followed_id, following_status)
    #             VALUES (%s, %s, TRUE)
    #             ON DUPLICATE KEY UPDATE following_status = TRUE
    #         """, (follower_id, followed_id))
    #     connection.commit()
    #     return jsonify({'message': 'User followed successfully'}), 200
    # except Exception as e:
    #     connection.rollback()
    #     return jsonify({'error': str(e)}), 500
    return jsonify({'message': 'User followed successfully'}), 200

#Remove a follow request
@collage.app.route('/api/remove_request', methods=['POST'])
def remove_request():
    # data = request.get_json()
    # follower_id = data['user_id']
    # followed_id = data['follow_id']
    # connection = collage.model.get_db()
    # try:
    #     with connection.cursor(dictionary=True) as cursor:
    #         cursor.execute("""
    #             INSERT INTO connections (follower_id, followed_id, following_status)
    #             VALUES (%s, %s, TRUE)
    #             ON DUPLICATE KEY UPDATE following_status = TRUE
    #         """, (follower_id, followed_id))
    #     connection.commit()
    #     return jsonify({'message': 'User followed successfully'}), 200
    # except Exception as e:
    #     connection.rollback()
    #     return jsonify({'error': str(e)}), 500
    return jsonify({'message': 'User successfully removed'}), 200

#Unfollow a user by setting following_status to FALSE.
@collage.app.route('/api/unfollow', methods=['DELETE'])
def unfollow_user():
    # data = request.get_json()
    # follower_id = data['user_id']
    # followed_id = data['follow_id']
    # connection = collage.model.get_db()
    # try:
    #     with connection.cursor(dictionary=True) as cursor:
    #         cursor.execute("""
    #             UPDATE connections 
    #             SET following_status = FALSE 
    #             WHERE follower_id = %s AND followed_id = %s
    #         """, (follower_id, followed_id))
    #     connection.commit()
    #     return jsonify({'message': 'User unfollowed successfully'}), 200
    # except Exception as e:
    #     connection.rollback()
    #     return jsonify({'error': str(e)}), 500
    return jsonify({'message': 'User unfollowed successfully'}), 200


#Remove a follower from the user's follower list.
@collage.app.route('/api/remove_follower', methods=['DELETE'])
def remove_follower():
    # data = request.get_json()
    # follower_id = data['follow_id']
    # followed_id = data['user_id']
    # connection = collage.model.get_db()
    # try:
    #     with connection.cursor(dictionary=True) as cursor:
    #         cursor.execute("""
    #             DELETE FROM connections 
    #             WHERE follower_id = %s AND followed_id = %s
    #         """, (follower_id, followed_id))
    #     connection.commit()
    #     return jsonify({'message': 'Follower removed successfully'}), 200
    # except Exception as e:
    #     connection.rollback()
    #     return jsonify({'error': str(e)}), 500
    return jsonify({'message': 'Follower removed successfully'}), 200

@collage.app.route('/', defaults={'path': ''})
@collage.app.route('/collage/<path:path>')
def catch_refresh(path):
    print(path)
    return flask.render_template('index.html')