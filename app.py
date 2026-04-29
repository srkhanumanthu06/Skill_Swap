import os
from dotenv import load_dotenv

load_dotenv()
import json
import sqlite3
import bcrypt
import jwt
import requests
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

PORT = int(os.getenv('PORT', 5000))
JWT_SECRET = 'super-secure-secret-skillswap-ai-2026'
DB_PATH = os.path.join(os.path.dirname(__file__), 'database.sqlite')

# In-memory mapping of username -> socket_id
connected_users = {}

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            teach_skills TEXT DEFAULT '[]',
            learn_skills TEXT DEFAULT '[]',
            avatar_initials TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_name TEXT NOT NULL,
            receiver_name TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_read BOOLEAN DEFAULT 0
        )
    ''')
    
    # Gracefully add new columns if they don't exist
    for col, col_type in [('age', 'INTEGER'), ('phone', 'TEXT'), ('bio', 'TEXT'), ('availability', 'TEXT')]:
        try:
            conn.execute(f'ALTER TABLE users ADD COLUMN {col} {col_type}')
        except sqlite3.OperationalError:
            pass  # Column already exists
            
    conn.commit()
    conn.close()
    print("Connected to SQLite database.")

# Middleware to verify JWT token
def authenticate_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Access denied. No token provided.'}), 401

        try:
            token = auth_header.split(" ")[1]
            user = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.user = user
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Invalid or expired token.'}), 403
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid or expired token.'}), 403
            
        return f(*args, **kwargs)
    return decorated_function

# --- AUTH ENDPOINTS ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required.'}), 400

    try:
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Generate initials
        parts = [p for p in name.split(' ') if p]
        initials = "".join([p[0].upper() for p in parts])[:2]
        if not initials:
            initials = 'U'

        # We don't read skills from registration anymore, they are set in Personalize Profile
        teach_array = []
        learn_array = []

        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO users (name, email, password, teach_skills, learn_skills, avatar_initials) VALUES (?, ?, ?, ?, ?, ?)",
                (name, email, hashed_password, json.dumps(teach_array), json.dumps(learn_array), initials)
            )
            conn.commit()
            user_id = cursor.lastrowid
            
            payload = {
                'id': user_id,
                'name': name,
                'email': email,
                'exp': datetime.now(timezone.utc) + timedelta(days=7)
            }
            token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
            
            return jsonify({
                'message': 'User registered successfully',
                'token': token,
                'user': {
                    'id': user_id,
                    'name': name,
                    'email': email,
                    'initials': initials,
                    'teach_skills': teach_array,
                    'learn_skills': learn_array
                }
            }), 201
            
        except sqlite3.IntegrityError as e:
            if 'UNIQUE' in str(e):
                return jsonify({'error': 'Email already exists.'}), 400
            raise e
        finally:
            conn.close()
            
    except Exception as e:
        return jsonify({'error': 'Server error.', 'details': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()

    if not user:
        return jsonify({'error': 'Invalid email or password.'}), 400

    stored_password = user['password']
    
    # Check password
    try:
        # Handling the case where bcryptjs hash was used in node (Python bcrypt accepts it)
        is_valid = bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8'))
    except Exception:
        is_valid = False
        
    if not is_valid:
        return jsonify({'error': 'Invalid email or password.'}), 400

    try:
        teach_skills = json.loads(user['teach_skills'])
    except Exception:
        teach_skills = []
        
    try:
        learn_skills = json.loads(user['learn_skills'])
    except Exception:
        learn_skills = []

    payload = {
        'id': user['id'],
        'name': user['name'],
        'email': user['email'],
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    
    user_dict = dict(user)
    
    return jsonify({
        'message': 'Logged in successfully',
        'token': token,
        'user': {
            'id': user_dict['id'],
            'name': user_dict['name'],
            'email': user_dict['email'],
            'initials': user_dict['avatar_initials'],
            'teach_skills': teach_skills,
            'learn_skills': learn_skills,
            'age': user_dict.get('age'),
            'phone': user_dict.get('phone'),
            'bio': user_dict.get('bio')
        }
    })

# --- USER ENDPOINTS ---

@app.route('/api/user/profile', methods=['GET'])
@authenticate_token
def get_profile():
    user_id = request.user.get('id')
    
    conn = get_db_connection()
    user = conn.execute("SELECT id, name, email, teach_skills, learn_skills, avatar_initials, created_at, age, phone, bio, availability FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()

    if not user:
        return jsonify({'error': 'User not found.'}), 404

    try:
        teach_skills = json.loads(user['teach_skills'])
    except Exception:
        teach_skills = []
        
    try:
        learn_skills = json.loads(user['learn_skills'])
    except Exception:
        learn_skills = []

    user_dict = dict(user)
    user_dict['teach_skills'] = teach_skills
    user_dict['learn_skills'] = learn_skills

    return jsonify({'user': user_dict})

@app.route('/api/user/profile', methods=['PUT'])
@authenticate_token
def update_profile():
    user_id = request.user.get('id')
    data = request.json
    
    name = data.get('name')
    age = data.get('age')
    phone = data.get('phone')
    bio = data.get('bio')
    availability = data.get('availability')
    teach_skills_str = data.get('teachSkills', '')
    learn_skills_str = data.get('learnSkills', '')

    teach_array = [s.strip() for s in teach_skills_str.split(',')] if teach_skills_str else []
    teach_array = [s for s in teach_array if s]
    
    learn_array = [s.strip() for s in learn_skills_str.split(',')] if learn_skills_str else []
    learn_array = [s for s in learn_array if s]

    conn = get_db_connection()
    try:
        # Re-generate initials if name changed
        if name:
            parts = [p for p in name.split(' ') if p]
            initials = "".join([p[0].upper() for p in parts])[:2]
            if not initials:
                initials = 'U'
            
            conn.execute(
                "UPDATE users SET name = ?, age = ?, phone = ?, bio = ?, teach_skills = ?, learn_skills = ?, availability = ?, avatar_initials = ? WHERE id = ?",
                (name, age, phone, bio, json.dumps(teach_array), json.dumps(learn_array), availability, initials, user_id)
            )
        else:
            conn.execute(
                "UPDATE users SET age = ?, phone = ?, bio = ?, teach_skills = ?, learn_skills = ?, availability = ? WHERE id = ?",
                (age, phone, bio, json.dumps(teach_array), json.dumps(learn_array), availability, user_id)
            )
        conn.commit()
    except Exception as e:
        return jsonify({'error': 'Failed to update profile', 'details': str(e)}), 500
    finally:
        conn.close()
        
    return jsonify({'message': 'Profile updated successfully'})

import re

@app.route('/api/ai-chat', methods=['POST'])
def ai_chat():
    data = request.json
    message = data.get('message', '').strip()
    
    if not message:
        return jsonify({'response': "Please say something!"})
        
    conn = get_db_connection()
    all_users = conn.execute("SELECT name, teach_skills FROM users").fetchall()
    conn.close()
    
    users_info = ""
    for u in all_users:
        try:
            ts = json.loads(u['teach_skills'])
            if ts:
                users_info += f"- {u['name']} teaches: {', '.join(ts)}\n"
        except Exception:
            pass

    prompt = f"<s>[INST] You are the SkillSwap AI Assistant. Your job is to match the user with skill partners. Here are the available users:\n{users_info}\nThe user says: '{message}'. Respond directly with 1-3 matching users who can teach them what they want to learn, and suggest a relevant study group. Format with line breaks using <br> tags. Keep your response brief and friendly. Do not output the user list. [/INST]"
    
    HF_API_KEY = os.getenv('HF_API_KEY', 'your_huggingface_token_here')
    HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
    
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    payload = {
        "inputs": prompt,
        "parameters": {"max_new_tokens": 250, "temperature": 0.7, "return_full_text": False}
    }
    
    try:
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0 and 'generated_text' in result[0]:
                bot_reply = result[0]['generated_text'].strip()
                bot_reply = bot_reply.replace('\n', '<br>')
                return jsonify({'response': bot_reply})
            else:
                return jsonify({'response': "Unexpected response from AI service. Please try again."})
        elif response.status_code == 503:
            return jsonify({'response': "AI Model is currently loading. Please wait 30 seconds and try again."})
        else:
            # Dynamic Offline Fallback
            msg_lower = message.lower()
            if 'python' in msg_lower or 'code' in msg_lower or 'web' in msg_lower or 'tech' in msg_lower:
                simulated_reply = "Hi! <i>(Offline Mode)</i> I see you're interested in tech! <b>Alex Kumar</b> is a great match for coding and web development. He's available for a swap this Thursday.<br><br>I also recommend joining the 'Beginner Tech' study group!"
            elif 'design' in msg_lower or 'ui' in msg_lower or 'ux' in msg_lower or 'figma' in msg_lower:
                simulated_reply = "Hi! <i>(Offline Mode)</i> Looking to learn design? <b>Sarah Johnson</b> is an expert in UI/UX and Figma. She has fantastic reviews from other learners.<br><br>Check out her profile on the Explore page!"
            elif 'music' in msg_lower or 'guitar' in msg_lower or 'piano' in msg_lower:
                simulated_reply = "Hi! <i>(Offline Mode)</i> That's awesome! <b>Marcus Chen</b> is currently offering guitar lessons and is looking to learn web design in return.<br><br>Want me to help you set up a session with him?"
            elif 'language' in msg_lower or 'spanish' in msg_lower or 'speak' in msg_lower:
                simulated_reply = "Hi! <i>(Offline Mode)</i> <b>Elena Rodriguez</b> is fluent in Spanish and loves helping beginners. She's looking to improve her English conversational skills in a swap.<br><br>Sound like a good match?"
            elif 'hi' in msg_lower or 'hello' in msg_lower or 'hey' in msg_lower:
                simulated_reply = "Hello there! <i>(Offline Mode)</i> What are you looking to learn today? I can help you find tutors for coding, design, music, languages, and more!"
            else:
                simulated_reply = f"Hi! <i>(Offline Mode)</i> You mentioned '{message}'. While I can't do a live deep search right now, I highly recommend checking out the 'Explore' page where you can find tutors for exactly that skill!"
                
            return jsonify({'response': simulated_reply})
            
    except Exception as e:
        msg_lower = message.lower()
        if 'python' in msg_lower or 'code' in msg_lower or 'web' in msg_lower or 'tech' in msg_lower:
            simulated_reply = "Hi! <i>(Offline Mode)</i> I see you're interested in tech! <b>Alex Kumar</b> is a great match for coding and web development. He's available for a swap this Thursday.<br><br>I also recommend joining the 'Beginner Tech' study group!"
        elif 'design' in msg_lower or 'ui' in msg_lower or 'ux' in msg_lower or 'figma' in msg_lower:
            simulated_reply = "Hi! <i>(Offline Mode)</i> Looking to learn design? <b>Sarah Johnson</b> is an expert in UI/UX and Figma. She has fantastic reviews from other learners.<br><br>Check out her profile on the Explore page!"
        elif 'music' in msg_lower or 'guitar' in msg_lower or 'piano' in msg_lower:
            simulated_reply = "Hi! <i>(Offline Mode)</i> That's awesome! <b>Marcus Chen</b> is currently offering guitar lessons and is looking to learn web design in return.<br><br>Want me to help you set up a session with him?"
        elif 'language' in msg_lower or 'spanish' in msg_lower or 'speak' in msg_lower:
            simulated_reply = "Hi! <i>(Offline Mode)</i> <b>Elena Rodriguez</b> is fluent in Spanish and loves helping beginners. She's looking to improve her English conversational skills in a swap.<br><br>Sound like a good match?"
        elif 'hi' in msg_lower or 'hello' in msg_lower or 'hey' in msg_lower:
            simulated_reply = "Hello there! <i>(Offline Mode)</i> What are you looking to learn today? I can help you find tutors for coding, design, music, languages, and more!"
        else:
            simulated_reply = f"Hi! <i>(Offline Mode)</i> You mentioned '{message}'. While I can't do a live deep search right now, I highly recommend checking out the 'Explore' page where you can find tutors for exactly that skill!"
            
        return jsonify({'response': simulated_reply})
        
    return jsonify({'response': "Sorry, I couldn't process that right now."})

# Fallback route for SPA and static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# --- SOCKET.IO EVENTS ---

@socketio.on('register')
def handle_register(data):
    username = data.get('username')
    if username:
        connected_users[username] = request.sid
        print(f"User {username} registered with socket {request.sid}")

@socketio.on('send_message')
def handle_send_message(data):
    sender = data.get('from')
    receiver = data.get('to')
    content = data.get('message')

    if not sender or not receiver or not content:
        return

    # Save to database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (sender_name, receiver_name, content) VALUES (?, ?, ?)",
        (sender, receiver, content)
    )
    conn.commit()
    conn.close()

    # Route message to receiver if they are online
    receiver_sid = connected_users.get(receiver)
    if receiver_sid:
        emit('receive_message', {
            'from': sender,
            'message': content,
            'time': datetime.now().strftime("%I:%M %p")
        }, room=receiver_sid)
        print(f"Message routed from {sender} to {receiver}")
    else:
        print(f"User {receiver} is offline. Message saved to DB.")

@socketio.on('disconnect')
def handle_disconnect():
    disconnected_user = None
    for username, sid in list(connected_users.items()):
        if sid == request.sid:
            disconnected_user = username
            del connected_users[username]
            break
    if disconnected_user:
        print(f"User {disconnected_user} disconnected.")

if __name__ == '__main__':
    init_db()
    socketio.run(app, port=PORT, debug=True, allow_unsafe_werkzeug=True)
