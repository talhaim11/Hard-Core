from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
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
    "root777": "root@example.com"
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
CORS(app, supports_credentials=True)

print("🚀 Flask is starting...")
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

POSTGRES_URL = os.getenv('POSTGRES_URL')

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
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        try:
            c.execute("ALTER TABLE sessions ADD COLUMN location TEXT DEFAULT NULL")
            conn.commit()
            print("✅ Column 'location' added successfully.")
        except psycopg2.Error as e:
            if "duplicate column name" in str(e):
                print("ℹ️ Column 'location' already exists.")
            else:
                raise e

def add_title_column():
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        try:
            c.execute("ALTER TABLE sessions ADD COLUMN title TEXT DEFAULT NULL")
            conn.commit()
            print("✅ Column 'title' added successfully.")
        except psycopg2.Error as e:
            if "duplicate column name" in str(e):
                print("ℹ️ Column 'title' already exists.")
            else:
                raise e

def create_tables():
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS "user" (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            );
        ''')
        c.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                title TEXT,
                date_time TIMESTAMP NOT NULL UNIQUE,
                location TEXT
            );
        ''')
        c.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
                session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
                UNIQUE(user_id, session_id)
            );
        ''')
        conn.commit()
        print("✅ Tables ensured.")

# קריאה לפונקציות 
# create_tables()
# add_location_column()
# add_title_column()


# --- ROUTES ---
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')
    token = data.get('token')

    # Require and check access token for registration
    if token not in ALLOWED_TOKENS or ALLOWED_TOKENS[token] != email:
        return jsonify({'error': 'Invalid token or email'}), 401

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    try:
        with psycopg2.connect(POSTGRES_URL) as conn:
            c = conn.cursor()
            c.execute('INSERT INTO "user" (email, password, role) VALUES (%s, %s, %s)',
                      (email, hashed_pw.decode('utf-8'), role))
            conn.commit()
        return jsonify({'message': 'User registered successfully', 'success': True}), 201
    except Exception as e:
        if 'unique constraint' in str(e).lower():
            return jsonify({'error': 'Email already exists'}), 409
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    print(f"[LOGIN] Received email: {email}")
    print(f"[LOGIN] Received password: {password}")

    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute('SELECT id, password, role FROM "user" WHERE email = %s', (email,))
        row = c.fetchone()

        if row:
            db_hash = row[1]
            print(f"[LOGIN] DB hash: {db_hash}")
            check_result = bcrypt.checkpw(password.encode('utf-8'), db_hash.encode('utf-8') if isinstance(db_hash, str) else db_hash)
            print(f"[LOGIN] bcrypt.checkpw result: {check_result}")
            if check_result:
                token = encode_token(row[0], row[2])
                return jsonify({'token': token, 'role': row[2]})
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/users', methods=['GET'])
def get_users():
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute('SELECT id, email, role FROM "user"')
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

    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()

        # הכנס את האימון אם הוא לא קיים
        c.execute("INSERT INTO sessions (date_time) VALUES (%s) ON CONFLICT (date_time) DO NOTHING", (date_time,))
        conn.commit()

        # קבל את מזהה האימון
        c.execute("SELECT id FROM sessions WHERE date_time = %s", (date_time,))
        session_id = c.fetchone()[0]

        # נסה לרשום את המשתמש לאימון
        try:
            c.execute("INSERT INTO user_sessions (user_id, session_id) VALUES (%s, %s)", (user_id, session_id))
            conn.commit()
            return jsonify({'message': 'Session booked successfully'})
        except psycopg2.IntegrityError:
            return jsonify({'error': 'Already registered for this session'}), 409
@app.route('/sessions', methods=['GET'])
def get_sessions():
    with psycopg2.connect(POSTGRES_URL) as conn:
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

    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute("INSERT INTO sessions (title, date_time, location) VALUES (%s, %s, %s)",
                  (title, date_time, location))
        conn.commit()

    return jsonify({'message': 'Session created successfully'}), 201


@app.route('/sessions/<int:session_id>', methods=['GET'])
def get_session_details(session_id):
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute("""
            SELECT u.id, u.email, u.role
            FROM users u
            JOIN user_sessions us ON u.id = us.user_id
            WHERE us.session_id = %s
        """, (session_id,))
        users = [
            {'id': row[0], 'email': row[1], 'role': row[2]}
            for row in c.fetchall()
        ]
    return jsonify(users)

@app.route('/sessions/<int:session_id>', methods=['DELETE'])
@token_required
def cancel_registration(current_user, session_id):
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute("DELETE FROM user_sessions WHERE user_id = %s AND session_id = %s", (current_user['id'], session_id))
        conn.commit()
    return jsonify({'message': 'Registration cancelled successfully'})
 
@app.route('/sessions/<int:session_id>', methods=['POST'])
@token_required
def register_to_session(current_user, session_id):
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()

        # בדיקה אם המשתמש כבר רשום
        c.execute("SELECT * FROM user_sessions WHERE user_id = %s AND session_id = %s", (current_user['id'], session_id))
        if c.fetchone():
            return jsonify({'message': 'Already registered for this session'}), 200

        # רישום חדש
        c.execute("INSERT INTO user_sessions (user_id, session_id) VALUES (%s, %s)", (current_user['id'], session_id))
        conn.commit()

    return jsonify({'message': 'Registered successfully'})

@app.route('/debug_users', methods=['GET'])
def debug_users():
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute("SELECT id, email FROM users")
        users = c.fetchall()
    return jsonify({'users': users})

@app.route('/debug_sessions', methods=['GET'])
def debug_sessions():
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute("SELECT id, date_time FROM sessions")
        sessions = c.fetchall()
    return jsonify({'sessions': sessions})

@app.route('/debug_user_sessions', methods=['GET'])
def debug_user_sessions():
    with psycopg2.connect(POSTGRES_URL) as conn:
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
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
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
    return jsonify(ALLOWED_TOKENS)

@app.route('/debug_secret_key', methods=['GET'])
def debug_secret_key():
    return jsonify({'secret_key': app.config['SECRET_KEY']})


@app.route('/debug_env', methods=['GET'])
def debug_env():
    env_vars = {key: value for key, value in os.environ.items() if key.startswith('DEBUG_')}
    return jsonify(env_vars)

@app.route('/debug_db_path', methods=['GET'])
def debug_db_path():
    return jsonify({'postgres_url': POSTGRES_URL})

@app.route('/debug_bcrypt', methods=['GET'])
def debug_bcrypt():
    test_password = "test123"
    hashed = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt())
    return jsonify({
        'test_password': test_password,
        'hashed_password': hashed.decode('utf-8'),

        'is_valid': bcrypt.checkpw(test_password.encode('utf-8'), hashed)
    })

@app.route('/sessions/<int:session_id>/users', methods=['GET'])
def get_session_users(session_id):
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute('''
            SELECT u.id, u.email, u.role
            FROM "user" u
            JOIN user_sessions us ON u.id = us.user_id
            WHERE us.session_id = %s
        ''', (session_id,))
        users = [
            {'id': row[0], 'email': row[1], 'role': row[2]}
            for row in c.fetchall()
        ]
    return jsonify({'users': users})




if __name__ == "__main__":
    from os import environ
    print(f"[STARTUP] POSTGRES_URL: {POSTGRES_URL}")
    # Try connecting to the database and print any errors
    try:
        create_tables()
        with psycopg2.connect(POSTGRES_URL) as conn:
            print("[STARTUP] Successfully connected to Postgres!")
    except Exception as e:
        print(f"[STARTUP] Failed to connect to Postgres: {e}")
    app.run(host='0.0.0.0', port=int(environ.get("PORT", 5000)))