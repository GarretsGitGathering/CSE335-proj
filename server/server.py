from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import os
import hashlib

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://cse350-proj-frontend.onrender.com"}})  # Apply CORS to all routes

# Render.com Database url
DATABASE_URL = "postgresql://social_media_x8e3_user:iKyOtjfyS7amEwOn7QXPMVjcMHbrvaEA@dpg-csnqhltumphs7386vuo0-a.oregon-postgres.render.com/social_media_x8e3"

# Connect to the database
def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

# Initialize the database (This is only used on first run)
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # create users table
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                        user_id SERIAL PRIMARY KEY,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        password TEXT NOT NULL)''')
    
    # create posts table
    cursor.execute('''CREATE TABLE IF NOT EXISTS posts (        
                        post_id SERIAL PRIMARY KEY,
                        user_id INTEGER REFERENCES users(user_id),
                        image_url TEXT,
                        description TEXT)''')
    
    conn.commit()
    cursor.close()
    conn.close()

init_db()

# Helper function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Sign-up Route
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'error': 'Username and password are required.'}), 400
    
    hashed_password = hash_password(password)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_password))
        conn.commit()
        return jsonify({'success': True}), 201
    except psycopg2.IntegrityError:
        return jsonify({'success': False, 'error': 'Username already exists.'}), 409
    finally:
        cursor.close()
        conn.close()

# Login Route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    hashed_password = hash_password(password)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM users WHERE username = %s AND password = %s", (username, hashed_password))
    user = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    if user:
        return jsonify({'success': True, 'user_id': user[0]})
    else:
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

# Create Post Route
@app.route('/createPost', methods=['POST'])
def create_post():
    data = request.get_json()
    user_id = data.get('user_id')
    image_url = data.get('image_url')
    description = data.get('description')
    
    if not user_id or not image_url or not description:
        return jsonify({'success': False, 'error': 'All fields are required.'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO posts (user_id, image_url, description) VALUES (%s, %s, %s)", (user_id, image_url, description))
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({'success': True}), 201

# Load Posts Route
@app.route('/getPosts', methods=['GET'])
def get_posts():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT posts.image_url, posts.description, users.username FROM posts JOIN users ON posts.user_id = users.user_id")
    posts = cursor.fetchall()
    cursor.close()
    conn.close()
    
    posts_list = [{'image_url': post[0], 'description': post[1], 'username': post[2]} for post in posts]
    
    return jsonify(posts_list)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)