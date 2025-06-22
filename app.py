from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import bcrypt
import jwt
import datetime
from dotenv import load_dotenv
load_dotenv()
import os
from functools import wraps
from flask import request, jsonify
import jwt


# --- CONSTANTS ---
# טוקנים מותרים לדוגמה (במציאות, יש לאחסן אותם בצורה מאובטחת יותר)
# לדוגמה, ניתן להשתמש ב-Redis או בבסיס נתונים אחר לאחסון טוקנים
# כאן הם מאוחסנים במילון פשוט לצורך הדגמה   
ALLOWED_TOKENS = {
    "abc123": "user1@example.com",
    "admin777": "admin@example.com",
    "xyz999": "guest@example.com"
}
SECRET_KEY = "your_secret_key_here"  # ודא שהמפתח הסודי שלך תואם למה שמשמש ביצירת הטוקן
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = {
              "id": data['sub'],
              "role": data['role']
            }
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401

        return f(current_user, *args, **kwargs)
    return decorated





# --- CONFIGURATION ---
app = Flask(__name__)
print("🚀 Flask is starting...")
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

DB_PATH = 'gym.db'

def create_tables():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        
        c.execute('''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user'
        )''')

        c.execute('''CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date_time TEXT NOT NULL UNIQUE
        )''')

        c.execute('''CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_id INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(session_id) REFERENCES sessions(id),
            UNIQUE(user_id, session_id)
        )''')

        conn.commit()

# --- AUTH HELPERS ---
def encode_token(user_id, role):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=6),
        'iat': datetime.datetime.utcnow(),
        'sub': str(user_id),
        'role': role
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def decode_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None

def add_location_column():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        try:
            c.execute("ALTER TABLE sessions ADD COLUMN location TEXT DEFAULT NULL")
            conn.commit()
            print("✅ Column 'location' added successfully.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("ℹ️ Column 'location' already exists.")
            else:
                raise e

def add_title_column():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        try:
            c.execute("ALTER TABLE sessions ADD COLUMN title TEXT DEFAULT NULL")
            conn.commit()
            print("✅ Column 'title' added successfully.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("ℹ️ Column 'title' already exists.")
            else:
                raise e

# קריאה לפונקציות 
create_tables()
add_location_column()
add_title_column()


# --- ROUTES ---
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    try:
        with sqlite3.connect(DB_PATH) as conn:
            c = conn.cursor()
            c.execute("INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
                      (email, hashed_pw, role))
            conn.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 409

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    token = data.get('token')

    # בדיקת טוקן קודם כול
    if token not in ALLOWED_TOKENS or ALLOWED_TOKENS[token] != email:
        return jsonify({'error': 'Invalid token or email'}), 401

    # בדיקת סיסמה מול SQLite
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("SELECT id, password, role FROM users WHERE email = ?", (email,))
        row = c.fetchone()

        if row and bcrypt.checkpw(password.encode('utf-8'), row[1].encode('utf-8') if isinstance(row[1], str) else row[1]):
            token = encode_token(row[0], row[2])
            return jsonify({'token': token, 'role': row[2]})
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/users', methods=['GET'])
def get_users():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("SELECT id, email, role FROM users")
        users = [{'id': row[0], 'email': row[1], 'role': row[2]} for row in c.fetchall()]
    return jsonify(users)

@app.route('/me', methods=['GET'])
def me():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing token'}), 401

    token = auth_header.split(" ")[-1]
    payload = decode_token(token)
    if not payload:
        return jsonify({'error': 'Invalid or expired token'}), 401

    return jsonify({'user_id': payload['sub'], 'role': payload['role']})

@app.route('/book-session', methods=['POST'])
def book_session():
    data = request.json
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    payload = decode_token(token)
    if not payload:
        return jsonify({'error': 'Invalid or expired token'}), 401

    user_id = payload['sub']
    date_time = data.get('date_time')  # מחרוזת בפורמט ISO: "2024-07-22T19:00"

    if not date_time:
        return jsonify({'error': 'Missing date_time'}), 400

    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()

        # הכנס את האימון אם הוא לא קיים
        c.execute("INSERT OR IGNORE INTO sessions (date_time) VALUES (?)", (date_time,))
        conn.commit()

        # קבל את מזהה האימון
        c.execute("SELECT id FROM sessions WHERE date_time = ?", (date_time,))
        session_id = c.fetchone()[0]

        # נסה לרשום את המשתמש לאימון
        try:
            c.execute("INSERT INTO user_sessions (user_id, session_id) VALUES (?, ?)", (user_id, session_id))
            conn.commit()
            return jsonify({'message': 'Session booked successfully'})
        except sqlite3.IntegrityError:
            return jsonify({'error': 'Already registered for this session'}), 409
@app.route('/sessions', methods=['GET'])
def get_sessions():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("""
            SELECT s.id, s.date_time, COUNT(us.user_id) as participant_count
            FROM sessions s
            LEFT JOIN user_sessions us ON s.id = us.session_id
            GROUP BY s.id, s.date_time
            ORDER BY s.date_time ASC
        """)
        sessions = [
            {'id': row[0], 'date_time': row[1], 'participants': row[2]}
            for row in c.fetchall()
        ]
    return jsonify({'sessions': sessions})

@app.route('/sessions', methods=['POST'])
@token_required
def create_session(payload):
    if payload['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.json
    title = data.get('title')
    date_time = data.get('date_time')
    location = data.get('location', 'Main Gym')  # ברירת מחדל

    if not title or not date_time:
        return jsonify({'error': 'Missing title or date_time'}), 400

    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("INSERT INTO sessions (title, date_time, location) VALUES (?, ?, ?)",
                  (title, date_time, location))
        conn.commit()

    return jsonify({'message': 'Session created successfully'}), 201


@app.route('/sessions/<int:session_id>', methods=['GET'])
def get_session_details(session_id):
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("""
            SELECT u.id, u.email, u.role
            FROM users u
            JOIN user_sessions us ON u.id = us.user_id
            WHERE us.session_id = ?
        """, (session_id,))
        users = [
            {'id': row[0], 'email': row[1], 'role': row[2]}
            for row in c.fetchall()
        ]
    return jsonify(users)

@app.route('/sessions/<int:session_id>', methods=['DELETE'])
@token_required
def cancel_registration(current_user, session_id):
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("DELETE FROM user_sessions WHERE user_id = ? AND session_id = ?", (current_user['id'], session_id))
        conn.commit()
    return jsonify({'message': 'Registration cancelled successfully'})
 
@app.route('/sessions/<int:session_id>', methods=['POST'])
@token_required
def register_to_session(current_user, session_id):
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()

        # בדיקה אם המשתמש כבר רשום
        c.execute("SELECT * FROM user_sessions WHERE user_id = ? AND session_id = ?", (current_user['id'], session_id))
        if c.fetchone():
            return jsonify({'message': 'Already registered for this session'}), 200

        # רישום חדש
        c.execute("INSERT INTO user_sessions (user_id, session_id) VALUES (?, ?)", (current_user['id'], session_id))
        conn.commit()

    return jsonify({'message': 'Registered successfully'})

@app.route('/debug_users', methods=['GET'])
def debug_users():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("SELECT id, email FROM users")
        users = c.fetchall()
    return jsonify({'users': users})

if __name__ == "__main__":
    from os import environ
    app.run(host='0.0.0.0', port=int(environ.get("PORT", 5000)))