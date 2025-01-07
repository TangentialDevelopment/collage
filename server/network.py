
from flask import request, jsonify
import flask
import collage
from flask_jwt_extended import jwt_required

#Return all followers for a given user.
@collage.app.route('/api/followers/<int:user_id>', methods=['GET'])
@jwt_required()
def get_followers(user_id):
    # MAKE SURE TO SET THE ...id NAME AS "id" SO THE NETWORK COMPONENT WORKS
    connection = collage.model.get_db()
    with connection.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT
                u.user_id AS id,
                u.full_name AS name,
                u.email,
                u.profile_img_url AS profileImage,
                u.major,
                u.graduation_year AS gradYear,
                u.followers_count AS followersCount,
                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(m.full_name)
                        FROM (
                            SELECT m.full_name
                            FROM connections c1
                            JOIN connections c2 ON c1.followed_id = c2.followed_id
                            JOIN users m ON c1.followed_id = m.user_id
                            WHERE c1.follower_id = %s
                            AND c2.follower_id = u.user_id
                            LIMIT 2
                        ) m
                    ), JSON_ARRAY()
                ) AS top_two_mutuals
            FROM users u
            JOIN connections c ON u.user_id = c.follower_id AND c.relationship = 'following'
            WHERE c.followed_id = %s AND u.user_id != %s
        """, (user_id, user_id, user_id))
        followers = cursor.fetchall()
    if followers:
        return jsonify(followers), 200
    else:
        return jsonify({'message': 'No followers'})

#Return all users a given user is following.
@collage.app.route('/api/following/<int:user_id>', methods=['GET'])
@jwt_required()
def get_following(user_id):
    connection = collage.model.get_db()
    with connection.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT
                u.user_id AS id,
                u.full_name AS name,
                u.email,
                u.profile_img_url AS profileImage,
                u.major,
                u.graduation_year AS gradYear,
                u.followers_count AS followersCount,
                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(m.full_name)
                        FROM (
                            SELECT m.full_name
                            FROM connections c1
                            JOIN connections c2 ON c1.followed_id = c2.followed_id
                            JOIN users m ON c1.followed_id = m.user_id
                            WHERE c1.follower_id = %s
                            AND c2.follower_id = u.user_id
                            LIMIT 2
                        ) m
                    ), JSON_ARRAY()
                ) AS top_two_mutuals
            FROM users u
            LEFT JOIN connections c ON u.user_id = c.followed_id AND c.follower_id = %s AND c.relationship = 'following'
            WHERE u.user_id != %s AND c.follower_id IS NOT NULL
        """, (user_id, user_id, user_id))
        following = cursor.fetchall()
    if following:
        return jsonify(following), 200
    else:
        return jsonify({'message': 'Not following anyone'})

#Return all follow requests a user has
@collage.app.route('/api/requests/<int:user_id>', methods=['GET'])
@jwt_required()
def get_requests(user_id):
    connection = collage.model.get_db()
    with connection.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT
                u.user_id AS id,
                u.full_name AS name,
                u.email,
                u.profile_img_url AS profileImage,
                u.major,
                u.graduation_year AS gradYear,
                u.followers_count AS followersCount,
                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(m.full_name)
                        FROM (
                            SELECT m.full_name
                            FROM connections c1
                            JOIN connections c2 ON c1.followed_id = c2.followed_id
                            JOIN users m ON c1.followed_id = m.user_id
                            WHERE c1.follower_id = %s
                            AND c2.follower_id = u.user_id
                            LIMIT 2
                        ) m
                    ), JSON_ARRAY()
                ) AS top_two_mutuals
            FROM users u
            JOIN connections c ON u.user_id = c.follower_id
            WHERE c.followed_id = %s AND c.relationship = 'pending'
        """, (user_id, user_id))
        requests = cursor.fetchall()
    if requests:
        return jsonify(requests), 200
    else:
        return jsonify({'message': 'No requests'})

#Return all suggested connections a user gets, THIS ENDPOINT NEEDS TESTING
@collage.app.route('/api/connects/<int:user_id>', methods=['GET'])
@jwt_required()
def get_connects(user_id):
    connection = collage.model.get_db()
    with connection.cursor(dictionary=True) as cursor:
        cursor.execute("""
            SELECT
                u.user_id AS id,
                u.full_name AS name,
                u.email,
                u.profile_img_url AS profileImage,
                u.major,
                u.graduation_year AS gradYear,
                u.followers_count AS followersCount,
                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(m.full_name)
                        FROM (
                            SELECT m.full_name
                            FROM connections c1
                            JOIN connections c2 ON c1.followed_id = c2.followed_id
                            JOIN users m ON c1.followed_id = m.user_id
                            WHERE c1.follower_id = %s
                            AND c2.follower_id = u.user_id
                            LIMIT 2
                        ) m
                    ), JSON_ARRAY()
                ) AS top_two_mutuals
            FROM users u
            LEFT JOIN connections c ON u.user_id = c.followed_id AND c.follower_id = %s
            WHERE u.user_id != %s AND c.follower_id IS NULL
            AND NOT EXISTS (
                SELECT 1
                FROM connections req
                WHERE req.follower_id = u.user_id
                AND req.followed_id = %s
                AND req.relationship = 'pending'
            )
        """, (user_id, user_id, user_id, user_id))
        suggested = cursor.fetchall()


    if suggested:
        return jsonify(suggested), 200
    else:
        return jsonify({'message': 'No suggested connections'})

#Follow a user by adding an entry in the connections table.
@collage.app.route('/api/follow', methods=['POST'])
@jwt_required()
def follow_user():
    data = request.get_json()
    follower_id = flask.session['user_id']
    followed_id = data['follow_id']
    connection = collage.model.get_db()
    try:
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("""
                INSERT INTO connections (follower_id, followed_id, relationship)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE relationship = %s
            """, (follower_id, followed_id, 'pending', 'pending'))
        connection.commit()
        return jsonify({'message': 'User followed successfully'}), 200
    except Exception as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500

@collage.app.route('/api/accept', methods=['POST'])
def accept_user():
    data = request.get_json()
    followed_id = data['user_id'] # The user who received the request
    follower_id = data['follow_id'] # The user who sent the request
    connection = collage.model.get_db()
    try:
        with connection.cursor(dictionary=True) as cursor:
            # Add or update the reverse relationship
            cursor.execute("""
                INSERT INTO connections (follower_id, followed_id, relationship)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE relationship = %s
            """, (followed_id, follower_id, 'following', 'following'))

            # Update the request from pending to following
            cursor.execute("""
                UPDATE connections
                SET relationship = %s
                WHERE follower_id = %s AND followed_id = %s AND relationship = 'pending'
            """, ('following', follower_id, followed_id))
        connection.commit()
        return jsonify({'message': 'User followed successfully'}), 200
    except Exception as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500

#Remove a follow request or follower
@collage.app.route('/api/remove_user', methods=['DELETE'])
@jwt_required()
def remove_request():
    data = request.get_json()
    followed_id = data['user_id']
    follower_id = data['follow_id']
    connection = collage.model.get_db()
    try:
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("""
                DELETE FROM connections
                WHERE follower_id = %s AND followed_id = %s
            """, (follower_id, followed_id))
        connection.commit()
        return jsonify({'message': 'User removed successfully'}), 200
    except Exception as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500

#Unfollow a user
@collage.app.route('/api/unfollow', methods=['DELETE'])
@jwt_required()
def unfollow_user():
    data = request.get_json()
    follower_id = data['user_id']
    followed_id = data['follow_id']
    connection = collage.model.get_db()
    try:
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute("""
                DELETE FROM connections
                WHERE follower_id = %s AND followed_id = %s
            """, (follower_id, followed_id))
        connection.commit()
        return jsonify({'message': 'User unfollowed successfully'}), 200
    except Exception as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
