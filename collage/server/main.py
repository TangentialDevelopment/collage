import flask
import collage
# from collage.server.auth import auth
from authlib.integrations.flask_client import OAuth
from collage.server.recommend import recommend_classes


# OAuth setup
oauth = OAuth(collage.app)

google = oauth.register(
    name='google',
    client_id='YOUR_CLIENT_ID',  # TODO: change this
    client_secret='YOUR_CLIENT_SECRET',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    userinfo_endpoint='https://www.googleapis.com/oauth2/v1/userinfo',  # This is only needed if using openId to fetch user info
    client_kwargs={'scope': 'openid profile email'},
)


@collage.app.route('/api/accounts/', methods=['POST'])
def handle_accounts():
    """Handles login/logout, creating/deleting/editing accounts, and updating passwords."""
    main_url = "/"
    form = flask.request.form
    op = form.get("operation")

    if op == "login":
        try:
            token = google.authorize_access_token()
            resp = google.get('userinfo')
            user_info = resp.json()
            flask.session['email'] = user_info['email']
            context = {
                "status": "success"
            }
        except Exception as e:
            context = {
                "status": "failure"
            }
        return flask.jsonify(**context)

    elif op == "logout":
        flask.session.pop('email', None)
        return flask.redirect(main_url)


@collage.app.route('/api/catalog/', methods=['POST'])
def handle_catalog():
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

    # return the JSON of "a list of dictionaries"
    """
    return example:
        [
            {
                "course_id": 101,
                "course_name": "Introduction to Python"
            },
            {
                "course_id": 102,
                "course_name": "Data Science with R"
            },
            {
                "course_id": 103,
                "course_name": "Machine Learning Basics"
            }
            ......
        ]
    """
    return flask.jsonify(recommendations.to_dict(orient='records'))


@collage.app.route('/api/student/<int:user_id>', methods=['GET'])
def get_user_stats(user_id):
    op = flask.request.args.get('operation')
    connection = collage.model.get_db()
    try:
        if op == 'user_stats':
            with connection.cursor(dictionary=True) as cursor:
                follower_query = """
                    SELECT COUNT(*)
                    AS follower_count
                    FROM followers
                    WHERE followed_id = %s
                """
                cursor.execute(follower_query, (user_id,))
                follower_count = cursor.fetchone()['follower_count']

                profile_view_query = """
                    SELECT COUNT(*)
                    AS view_count
                    FROM profileViewers
                    WHERE viewed_id = %s
                """

                cursor.execute(profile_view_query, (user_id,))
                view_count = cursor.fetchone()['view_count']

            response = {
                'follower_count': follower_count,
                'view_count': view_count
            }

        elif op == 'student_info':
            with connection.cursor(dictionary=True) as cursor:
                student_info_query = """
                    SELECT graduation_year, start_year
                    FROM users
                    WHERE user_id = %s
                """
                cursor.execute(student_info_query, (user_id,))
                student_info = cursor.fetchone()

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

            response = {
                'graduation_year': student_info['graduation_year'],
                'registration_term': student_info['start_year'],
                'credits_completed': credits_completed,
                'credits_required': credits_required
            }

        else:
            response = {'error': 'Invalid operation specified'}

        return flask.jsonify(response)

    except Exception as e:
        return flask.jsonify({'error': str(e)}), 500

    finally:
        connection.close()