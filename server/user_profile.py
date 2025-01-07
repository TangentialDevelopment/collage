from flask import jsonify, request, session
import mysql.connector
import collage
from flask_jwt_extended import jwt_required

# Route to get registration information
@collage.app.route('/api/registration-info/<int:user_id>', methods=['GET'])
@jwt_required()
def get_registration_info(user_id):
    # user_email = flask.session['current_user']
    connection = collage.model.get_db()
    try:
        with connection.cursor(dictionary=True) as cursor:
            # # Fetch user registration information
            # query = """
            #     SELECT credits_completed,
            #         (100 - credits_completed) AS credits_to_complete_major, -- example calculation
            #         5 AS credits_to_complete_minor1, -- replace with actual calculations or columns
            #         12 AS credits_to_complete_minor2, -- replace with actual calculations or columns
            #         DATE_FORMAT(enrollment_date, '%M %d at %h:%i%p') AS registration_date,
            #         'Fall 2024' AS registration_term  -- replace with actual column if needed
            #     FROM users
            #     WHERE user_id = %s
            # """
            # cursor.execute(query, (user_id,))
            # user_data = cursor.fetchone()

            personal_info_query = """
                SELECT users.profile_img_url, users.full_name, users.pronouns, users.major, users.minor, users.college, users.graduation_year, users.enrollment_date, users.email, users.linkedin_url,
                (SELECT COUNT(*) FROM connections c WHERE c.followed_id = users.user_id AND relationship = 'following') AS follower_count,
                (SELECT COUNT(*) FROM connections c WHERE c.follower_id = users.user_id AND relationship = 'following') AS following_count
                FROM users WHERE users.user_id = %s
            """
            cursor.execute(personal_info_query, (user_id,))
            personal_data = cursor.fetchone()

            return jsonify({'personal': personal_data})

    except mysql.connector.Error as err:
        print("Error:", err)
        return jsonify({'error': 'Database error'}), 500

@collage.app.route('/api/update-pfp', methods=['POST'])
@jwt_required()
def update_pfp():
    data = request.get_json()
    connection = collage.model.get_db()
    with connection.cursor(dictionary=True) as cursor:
        update_query = """
                    UPDATE users SET profile_img_url = %s WHERE email = %s
                """
        cursor.execute(update_query, (data['profile_img_url'], session['current_user']))
    connection.commit()
    return jsonify(success=True), 200 # also send back any other needed information later

@collage.app.route('/api/update-schedule', methods=['POST'])
@jwt_required()
def update_schedule():
    data = request.get_json()
    connection = collage.model.get_db()
    with connection.cursor(dictionary=True) as cursor:
        update_query = """
            UPDATE users SET schedule_ics_url = %s WHERE user_id = %s
        """
        cursor.execute(update_query, (data['schedule_img_url'], data['user_id']))
    connection.commit()
    return jsonify(success=True), 200

@collage.app.route('/api/get-schedule/<int:user_id>', methods=['GET'])
@jwt_required()
def get_schedule(user_id):
    connection = collage.model.get_db()
    with connection.cursor(dictionary=True) as cursor:
        query = """
            SELECT schedule_ics_url FROM users WHERE user_id = %s
        """
        cursor.execute(query, (user_id,))
        url = cursor.fetchone()['schedule_ics_url']
    connection.commit()
    return jsonify(schedule_ics_url=url), 200

@collage.app.route('/api/test-pfp', methods=['GET'])
@jwt_required()
def get_test_pfp():
    # session['current_user'] = 'jadensun@umich.edu'
    connection = collage.model.get_db()
    with connection.cursor(dictionary=True) as cursor:
        update_query = """
                    SELECT profile_img_url FROM users WHERE email = %s
                """
        cursor.execute(update_query, (session['current_user'],))
        url = cursor.fetchall()[0]['profile_img_url']
    return jsonify(profile_img_url=url), 200
# @collage.app.route('/api/personal-info/<int:user_id>', methods=['GET'])
# def get_personal_info(user_id):
#     conn = collage.model.get_db()
#     with conn.cursor(dictionary=True) as cursor:
#         cursor.execute("""
#             SELECT profile_img_url, full_name, major,
#         """)

@collage.app.route('/api/update-profile', methods=['POST'])
@jwt_required()
def update_profile():
    data = request.get_json()
    info = data['profile']
    major = data['major']
    minor = data['minor']
    user_id = data['user_id']
    connection = collage.model.get_db()
    with connection.cursor(dictionary=True) as cursor:
        update_query = """
            UPDATE users
            SET full_name = %s, pronouns = %s, major = %s, minor = %s, college = %s, graduation_year = %s, enrollment_date = %s, linkedin_url = %s, email = %s
            WHERE user_id = %s
        """
        cursor.execute(update_query, (info['full_name'], info['pronouns'], major, minor, info['college'], info['graduation_year'], info['enrollment_date'], info['linkedin_url'], info['email'], user_id))
    connection.commit()
    return jsonify({'message': 'Profile updated successfully'}), 200
