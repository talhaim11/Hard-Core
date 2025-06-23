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
    "xyz999": "guest@example.com",
    "itay777": "Itayshriker@gmail.com"
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

        c.execute('''CREATE TABLE IF NOT EXISTS allowed_tokens (
            token TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE
        )''')
        conn.commit()

# --- AUTH HELPERS ---
def encode_token(user_id, role):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=6),
        'iat': datetime.datetime.utcnow(),
        'sub': str(user_id),  # Ensure user_id is always a string
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


def create_attendance_table():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            hour INTEGER NOT NULL,
            note TEXT,
            UNIQUE(user_id, date, hour),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )''')
        conn.commit()

create_attendance_table()


# --- ROUTES ---
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')
    token = data.get('token')

    if not token:
        return jsonify({'error': 'Missing access token'}), 400

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    try:
        with sqlite3.connect(DB_PATH) as conn:
            c = conn.cursor()
            c.execute("INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
                      (email, hashed_pw, role))
            # Insert token into allowed_tokens
            c.execute("INSERT INTO allowed_tokens (token, email) VALUES (?, ?)", (token, email))
            conn.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError as e:
        if 'users.email' in str(e):
            return jsonify({'error': 'Email already exists'}), 409
        elif 'allowed_tokens.token' in str(e) or 'allowed_tokens.email' in str(e):
            return jsonify({'error': 'Token or email already used'}), 409
        else:
            return jsonify({'error': 'Registration failed', 'details': str(e)}), 400

@app.route('/login', methods=['POST'])
def login():
    print("DEBUG: /login route called")  # Add this line
    data = request.json
    email = data.get('email')
    password = data.get('password')
    token = data.get('token')

    # Check token in allowed_tokens table
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("SELECT email FROM allowed_tokens WHERE token = ?", (token,))
        row = c.fetchone()
        print(f"DEBUG: allowed_tokens row for token={token}: {row}")  # DEBUG
        if not row or row[0] != email:
            print("DEBUG: Invalid token or email")  # DEBUG
            return jsonify({'error': 'Invalid token or email'}), 401

        # Check password in users table
        c.execute("SELECT id, password, role FROM users WHERE email = ?", (email,))
        user_row = c.fetchone()
        print(f"DEBUG: users row for email={email}: {user_row}")  # DEBUG
        if user_row:
            db_password = user_row[1]
            # Ensure db_password is bytes for bcrypt
            if isinstance(db_password, str):
                db_password = db_password.encode('utf-8')
            password_ok = bcrypt.checkpw(password.encode('utf-8'), db_password)
            print(f"DEBUG: password_ok={password_ok}")  # DEBUG
            if password_ok:
                token_jwt = encode_token(str(user_row[0]), user_row[2])  # Ensure user_id is a string
                return jsonify({'token': token_jwt, 'role': user_row[2]})
        print("DEBUG: Invalid credentials")  # DEBUG
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

@app.route('/debug_sessions', methods=['GET'])
def debug_sessions():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("SELECT id, date_time FROM sessions")
        sessions = c.fetchall()
    return jsonify({'sessions': sessions})

@app.route('/debug_user_sessions', methods=['GET'])
def debug_user_sessions():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("""
            SELECT us.id, u.email, s.date_time
            FROM user_sessions us
            JOIN users u ON us.user_id = u.id
            JOIN sessions s ON us.session_id = s.id
        """)
        user_sessions = c.fetchall()
    return jsonify({'user_sessions': user_sessions})

@app.route('/debug', methods=['GET'])
def debug():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = c.fetchall()
    return jsonify({'tables': [table[0] for table in tables]})

@app.route('/debug_token', methods=['GET'])
def debug_token():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        return jsonify({'error': 'Missing token'}), 401

    payload = decode_token(token)
    if not payload:
        return jsonify({'error': 'Invalid or expired token'}), 401

    return jsonify({'user_id': payload['sub'], 'role': payload['role']})

@app.route('/debug_allowed_tokens', methods=['GET'])
def debug_allowed_tokens():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("SELECT token, email FROM allowed_tokens")
        tokens = c.fetchall()
    return jsonify({token: email for token, email in tokens})

@app.route('/debug_secret_key', methods=['GET'])
def debug_secret_key():
    return jsonify({'secret_key': app.config['SECRET_KEY']})


@app.route('/debug_env', methods=['GET'])
def debug_env():
    env_vars = {key: value for key, value in os.environ.items() if key.startswith('DEBUG_')}
    return jsonify(env_vars)

@app.route('/debug_db_path', methods=['GET'])
def debug_db_path():
    return jsonify({'db_path': DB_PATH})

@app.route('/debug_bcrypt', methods=['GET'])
def debug_bcrypt():
    test_password = "test123"
    hashed = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt())
    return jsonify({
        'test_password': test_password,
        'hashed_password': hashed.decode('utf-8'),
        'is_valid': bcrypt.checkpw(test_password.encode('utf-8'), hashed)
    })



@app.route('/users/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(current_user, user_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        # Remove from allowed_tokens as well
        c.execute("SELECT email FROM users WHERE id = ?", (user_id,))
        row = c.fetchone()
        if not row:
            return jsonify({'error': 'User not found'}), 404
        email = row[0]
        c.execute("DELETE FROM allowed_tokens WHERE email = ?", (email,))
        c.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
    return jsonify({'message': 'User deleted successfully'})

@app.route('/attendance', methods=['GET'])
@token_required
def get_attendance(current_user):
    # Get attendance for the next 2 weeks for all users
    today = datetime.date.today()
    start = today - datetime.timedelta(days=today.weekday()+1)  # Sunday of this week
    end = start + datetime.timedelta(days=13)  # 2 weeks
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute('''
            SELECT a.date, a.hour, a.note, u.email, u.id
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            WHERE date(a.date) BETWEEN ? AND ?
        ''', (start.isoformat(), end.isoformat()))
        records = c.fetchall()
    # Group by date and hour
    attendance = {}
    for date, hour, note, email, user_id in records:
        attendance.setdefault(date, {}).setdefault(hour, []).append({
            'email': email,
            'user_id': user_id,
            'note': note
        })
    return jsonify({'attendance': attendance, 'start': start.isoformat(), 'end': end.isoformat()})

@app.route('/attendance', methods=['POST'])
@token_required
def set_attendance(current_user):
    data = request.json
    date = data.get('date')
    hour = data.get('hour')
    note = data.get('note', '')
    user_id = current_user['id']
    if not date or hour is None:
        return jsonify({'error': 'Missing date or hour'}), 400
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute('''INSERT OR REPLACE INTO attendance (user_id, date, hour, note) VALUES (?, ?, ?, ?)''',
                  (user_id, date, hour, note))
        conn.commit()
    return jsonify({'message': 'Attendance updated'})


if __name__ == "__main__":
    from os import environ
    app.run(host='0.0.0.0', port=int(environ.get("PORT", 5000)))