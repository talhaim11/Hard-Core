from flask_cors import CORS

import psycopg2
import bcrypt
import jwt
import datetime
from dotenv import load_dotenv
load_dotenv()
import os
from functools import wraps
from flask import Flask, request, jsonify
import jwt


# --- CONFIGURATION ---
app = Flask(__name__)
from flask_cors import CORS

CORS(
    app,
    supports_credentials=True,
    origins=[
        "https://gym-frontend-staging.netlify.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)
print("🚀 Flask is starting...")
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

POSTGRES_URL = os.getenv('POSTGRES_URL') or os.getenv('DATABASE_URL')
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Allow preflight OPTIONS requests to pass through without auth
        if request.method == 'OPTIONS':
            return '', 204
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[-1]
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = {
              "id": data['sub'],
              "role": data['role']
            }
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
        return f(current_user, *args, **kwargs)
    return decorated

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
            c.execute("ALTER TABLE session ADD COLUMN location TEXT DEFAULT NULL")
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
            c.execute("ALTER TABLE session ADD COLUMN title TEXT DEFAULT NULL")
            conn.commit()
            print("✅ Column 'title' added successfully.")
        except psycopg2.Error as e:
            if "duplicate column name" in str(e):
                print("ℹ️ Column 'title' already exists.")
            else:
                raise e

def add_name_column():
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        try:
            c.execute('ALTER TABLE "user" ADD COLUMN name TEXT DEFAULT NULL')
            conn.commit()
            print("✅ Column 'name' added successfully.")
        except psycopg2.Error as e:
            if "duplicate column name" in str(e) or "already exists" in str(e):
                print("ℹ️ Column 'name' already exists.")
            else:
                raise e

def add_session_type_column():
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        try:
            c.execute("ALTER TABLE session ADD COLUMN session_type TEXT DEFAULT 'regular'")
            conn.commit()
            print("✅ Column 'session_type' added successfully.")
        except psycopg2.Error as e:
            if "duplicate column name" in str(e) or "already exists" in str(e):
                print("ℹ️ Column 'session_type' already exists.")
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
            CREATE TABLE IF NOT EXISTS session (
                id SERIAL PRIMARY KEY,
                title TEXT,
                date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                location TEXT,
                session_type TEXT DEFAULT 'regular'
            );
        ''')
        c.execute('''
            CREATE TABLE IF NOT EXISTS user_session (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
                session_id INTEGER REFERENCES session(id) ON DELETE CASCADE,
                UNIQUE(user_id, session_id)
            );
        ''')
        conn.commit()
        print("✅ Tables ensured.")

def create_invite_token_table():
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS invite_token (
                id SERIAL PRIMARY KEY,
                token TEXT UNIQUE NOT NULL,
                email TEXT,
                role TEXT NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        conn.commit()
        print("✅ Table 'invite_token' ensured.")

# קריאה לפונקציות 
# create_tables()
# add_location_column()
# add_title_column()
# add_name_column()
# add_session_type_column()
create_invite_token_table()


# --- ROUTES ---
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    token = data.get('token')

    # Require and check invite token for registration
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute('SELECT id, used, email, role FROM invite_token WHERE token = %s', (token,))
        row = c.fetchone()
        if not row:
            return jsonify({'error': 'Invalid invite token'}), 401
        if row[1]:
            return jsonify({'error': 'Invite token already used'}), 401
        if row[2] and row[2] != email:
            return jsonify({'error': 'Token is for a different email'}), 401
        role = row[3]  # Always use the role from the invite token

        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        try:
            c.execute('INSERT INTO "user" (email, password, role) VALUES (%s, %s, %s)', (email, hashed_pw.decode('utf-8'), role))
            c.execute('UPDATE invite_token SET used = TRUE WHERE id = %s', (row[0],))
            conn.commit()
            return jsonify({'message': 'User registered successfully', 'success': True}), 201
        except Exception as e:
            if 'unique constraint' in str(e).lower():
                return jsonify({'error': 'Email already exists'}), 409
            return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email_or_username = data.get('email')
    password = data.get('password')

    print(f"[LOGIN] Received email/username: {email_or_username}")
    print(f"[LOGIN] Received password: {password}")

    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        # Try to find user by email or username (since your DB uses both in the 'email' field)
        c.execute('SELECT id, password, role FROM "user" WHERE email = %s OR email = %s', (email_or_username, email_or_username))
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

@app.route('/debug-routes')
def debug_routes():
    output = []
    for rule in app.url_map.iter_rules():
        methods = ','.join(sorted(rule.methods))
        output.append(f"{rule.rule} [{methods}]")
    return '<br>'.join(output)


# Admin delete user by email (for InviteTokenManager)
@app.route('/admin/users', methods=['DELETE', 'OPTIONS'])
@token_required
def admin_delete_user(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        # Get user id by email
        c.execute('SELECT id FROM "user" WHERE email = %s', (email,))
        row = c.fetchone()
        if not row:
            return jsonify({'error': 'User not found'}), 404
        user_id = row[0]
        
        # Delete from user_session first
        c.execute('DELETE FROM user_session WHERE user_id = %s', (user_id,))
        
        # Delete from attendance records
        c.execute('DELETE FROM attendance WHERE user_id = %s', (user_id,))
        
        # Delete the user
        c.execute('DELETE FROM "user" WHERE id = %s', (user_id,))
        
        # Delete associated invite tokens
        c.execute('DELETE FROM invite_token WHERE email = %s', (email,))
        
        conn.commit()
    return jsonify({'message': 'User and associated tokens deleted successfully'})


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

# Legacy endpoint - commented out as it uses old schema
# @app.route('/book-session', methods=['POST'])
# def book_session():
#     data = request.json
#     token = request.headers.get('Authorization', '').replace('Bearer ', '')
#     payload = decode_token(token)
#     if not payload:
#         return jsonify({'error': 'Invalid or expired token'}), 401
# 
#     user_id = payload['sub']
#     date_time = data.get('date_time')  # מחרוזת בפורמט ISO: "2024-07-22T19:00"
# 
#     if not date_time:
#         return jsonify({'error': 'Missing date_time'}), 400
# 
#     with psycopg2.connect(POSTGRES_URL) as conn:
#         c = conn.cursor()
# 
#         # הכנס את האימון אם הוא לא קיים
#         c.execute("INSERT INTO session (date_time) VALUES (%s) ON CONFLICT (date_time) DO NOTHING", (date_time,))
#         conn.commit()
# 
#         # קבל את מזהה האימון
#         c.execute("SELECT id FROM session WHERE date_time = %s", (date_time,))
#         session_id = c.fetchone()[0]
# 
#         # נסה לרשום את המשתמש לאימון
#         try:
#             c.execute("INSERT INTO user_session (user_id, session_id) VALUES (%s, %s)", (user_id, session_id))
#             conn.commit()
#             return jsonify({'message': 'Session booked successfully'})
#         except psycopg2.IntegrityError:
#             return jsonify({'error': 'Already registered for this session'}), 409
@app.route('/sessions', methods=['GET'])
def get_sessions():
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        try:
            # Try with session_type column first
            c.execute('''
                SELECT s.id, s.date, s.start_time, s.end_time, s.title, s.session_type, COUNT(us.user_id) as participant_count
                FROM session s
                LEFT JOIN user_session us ON s.id = us.session_id
                GROUP BY s.id, s.date, s.start_time, s.end_time, s.title, s.session_type
                ORDER BY s.date ASC, s.start_time ASC
            ''')
            sessions = [
                {'id': row[0], 'date': str(row[1]), 'start_time': str(row[2]), 'end_time': str(row[3]), 'title': row[4], 'session_type': row[5] or 'regular', 'participants': row[6]}
                for row in c.fetchall()
            ]
        except psycopg2.Error:
            # Fallback to query without session_type column
            c.execute('''
                SELECT s.id, s.date, s.start_time, s.end_time, s.title, COUNT(us.user_id) as participant_count
                FROM session s
                LEFT JOIN user_session us ON s.id = us.session_id
                GROUP BY s.id, s.date, s.start_time, s.end_time, s.title
                ORDER BY s.date ASC, s.start_time ASC
            ''')
            sessions = [
                {'id': row[0], 'date': str(row[1]), 'start_time': str(row[2]), 'end_time': str(row[3]), 'title': row[4], 'session_type': 'regular', 'participants': row[5]}
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
    dates = data.get('dates')  # Array of dates in YYYY-MM-DD format
    start_time = data.get('start_time')  # HH:MM format
    end_time = data.get('end_time')  # HH:MM format
    session_type = data.get('session_type', 'regular')  # 'regular' or 'blocked'

    if not title or not dates or not start_time or not end_time:
        return jsonify({'error': 'Missing required fields: title, dates, start_time, end_time'}), 400

    created = []
    skipped = []
    deleted_sessions = []
    
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        for date_str in dates:
            try:
                # Check for overlaps
                overlapping = check_time_overlap(date_str, start_time, end_time)
                
                if overlapping:
                    if session_type == 'blocked':
                        # Delete overlapping regular sessions
                        regular_sessions = [s for s in overlapping if s[4] != 'blocked']
                        for session in regular_sessions:
                            c.execute('DELETE FROM user_session WHERE session_id = %s', (session[0],))
                            c.execute('DELETE FROM session WHERE id = %s', (session[0],))
                            deleted_sessions.append(f"{session[1]} on {date_str}")
                    else:
                        # Check if there are blocked sessions preventing creation
                        blocked_sessions = [s for s in overlapping if s[4] == 'blocked']
                        if blocked_sessions:
                            skipped.append({
                                'date': date_str, 
                                'reason': 'Time slot is blocked for personal trainer usage'
                            })
                            continue
                        
                        # Check for regular session overlaps
                        regular_overlaps = [s for s in overlapping if s[4] != 'blocked']
                        if regular_overlaps:
                            skipped.append({
                                'date': date_str, 
                                'reason': f'Overlaps with existing session: {regular_overlaps[0][1]}'
                            })
                            continue
                
                # Create the session
                c.execute("INSERT INTO session (title, date, start_time, end_time, session_type) VALUES (%s, %s, %s, %s, %s) RETURNING id", 
                         (title, date_str, start_time, end_time, session_type))
                session_id = c.fetchone()[0]
                created.append({'date': date_str, 'id': session_id})
                
            except psycopg2.IntegrityError:
                skipped.append({'date': date_str, 'reason': 'Database constraint violation'})
        
        conn.commit()

    response = {
        'message': f'Created {len(created)} sessions, skipped {len(skipped)}',
        'created': created,
        'skipped': skipped
    }
    
    if deleted_sessions:
        response['deleted'] = deleted_sessions
        response['message'] += f', deleted {len(deleted_sessions)} overlapping sessions'

    return jsonify(response), 201


@app.route('/invite-tokens/cleanup', methods=['POST'])
@token_required
def cleanup_invite_tokens(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        
        # Count tokens before cleanup
        c.execute('SELECT COUNT(*) FROM invite_token')
        before_count = c.fetchone()[0]
        
        # Only delete tokens that are truly orphaned:
        # 1. Unused tokens with no email (free tokens)
        c.execute('''
            DELETE FROM invite_token 
            WHERE used = FALSE AND (email IS NULL OR email = '')
        ''')
        
        # 2. Used tokens where the user was deleted (orphaned tokens)
        # But ONLY if there are actually users in the system to compare against
        c.execute('SELECT COUNT(*) FROM "user"')
        user_count = c.fetchone()[0]
        
        if user_count > 0:
            c.execute('''
                DELETE FROM invite_token 
                WHERE used = TRUE AND email IS NOT NULL AND email != '' 
                AND email NOT IN (SELECT email FROM "user")
            ''')
        
        conn.commit()
        
        # Count tokens after cleanup
        c.execute('SELECT COUNT(*) FROM invite_token')
        after_count = c.fetchone()[0]
        deleted_count = before_count - after_count
        
    return jsonify({
        'message': f'Cleaned up {deleted_count} unused/orphaned tokens.',
        'deleted_count': deleted_count,
        'remaining_count': after_count,
        'user_count': user_count
    })


@app.route('/sessions/<int:session_id>', methods=['GET'])
def get_session_details(session_id):
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute("""
            SELECT u.id, u.email, u.role
            FROM "user" u
            JOIN user_session us ON u.id = us.user_id
            WHERE us.session_id = %s
        """, (session_id,))
        users = [
            {'id': row[0], 'email': row[1], 'role': row[2]}
            for row in c.fetchall()
        ]
    return jsonify(users)

## Removed duplicate DELETE route for /sessions/<int:session_id> to allow admin delete_session to work
 
# --- Helper for session registration ---
def _handle_session_registration(current_user, session_id):
    try:
        with psycopg2.connect(POSTGRES_URL) as conn:
            c = conn.cursor()
            print(f"[DEBUG] Attempting to register user_id={current_user['id']} to session_id={session_id}")
            # Check if user exists
            c.execute('SELECT id FROM "user" WHERE id = %s', (current_user['id'],))
            user_row = c.fetchone()
            print(f"[DEBUG] User exists: {user_row}")
            if not user_row:
                return jsonify({'error': 'User does not exist'}), 404
            # Check if session exists and get its type
            c.execute('SELECT id, session_type FROM session WHERE id = %s', (session_id,))
            session_row = c.fetchone()
            print(f"[DEBUG] Session exists: {session_row}")
            if not session_row:
                return jsonify({'error': 'Session does not exist'}), 404
            # Check if session is blocked
            session_type = session_row[1] or 'regular'
            if session_type == 'blocked':
                return jsonify({'error': 'Cannot register for blocked sessions'}), 403
            # Check if already registered
            c.execute('SELECT * FROM user_session WHERE user_id = %s AND session_id = %s', (current_user['id'], session_id))
            if c.fetchone():
                print("[DEBUG] User already registered for this session")
                return jsonify({'message': 'Already registered for this session'}), 200
            
            # *** NEW: Check if user has valid subscription ***
            subscription_check = _check_user_subscription(current_user['id'], c)
            if not subscription_check['valid']:
                return jsonify({'error': subscription_check['message']}), 403
            
            # Register
            c.execute('INSERT INTO user_session (user_id, session_id) VALUES (%s, %s)', (current_user['id'], session_id))
            
            # *** NEW: Update subscription usage ***
            _update_subscription_usage(current_user['id'], c)
            
            conn.commit()
            print("[DEBUG] Registration successful")
        return jsonify({'message': 'Registered successfully'})
    except Exception as e:
        import traceback
        print('[ERROR] Exception in _handle_session_registration:', e)
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/debug_users', methods=['GET'])
def debug_users():
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute('SELECT id, email FROM "user"')
        users = c.fetchall()
    return jsonify({'users': users})

@app.route('/debug_sessions', methods=['GET'])
def debug_sessions():
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        try:
            c.execute('SELECT id, date, start_time, end_time, title FROM session')
            sessions = [{'id': row[0], 'date': str(row[1]), 'start_time': str(row[2]), 'end_time': str(row[3]), 'title': row[4]} for row in c.fetchall()]
        except psycopg2.Error:
            c.execute('SELECT id, date_time FROM session')
            sessions = [{'id': row[0], 'date_time': row[1]} for row in c.fetchall()]
    return jsonify({'sessions': sessions})

@app.route('/debug_user_sessions', methods=['GET'])
def debug_user_sessions():
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        try:
            c.execute('''
                SELECT us.id, u.email, s.date, s.start_time, s.end_time, s.title
                FROM user_session us
                JOIN "user" u ON us.user_id = u.id
                JOIN session s ON us.session_id = s.id
            ''')
            user_sessions = [{'id': row[0], 'email': row[1], 'date': str(row[2]), 'start_time': str(row[3]), 'end_time': str(row[4]), 'title': row[5]} for row in c.fetchall()]
        except psycopg2.Error:
            c.execute('''
                SELECT us.id, u.email, s.date_time
                FROM user_session us
                JOIN "user" u ON us.user_id = u.id
                JOIN session s ON us.session_id = s.id
            ''')
            user_sessions = [{'id': row[0], 'email': row[1], 'date_time': row[2]} for row in c.fetchall()]
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
    print(f"[DEBUG] get_session_users called for session_id={session_id}")
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute('''
            SELECT u.id, u.email, u.role
            FROM "user" u
            JOIN user_session us ON u.id = us.user_id
            WHERE us.session_id = %s
        ''', (session_id,))
        rows = c.fetchall()
        print(f"[DEBUG] Session {session_id} users query result: {rows}")
        users = [
            {'id': row[0], 'email': row[1], 'role': row[2]}
            for row in rows
        ]
        print(f"[DEBUG] Session {session_id} users parsed: {users}")
    return jsonify({'users': users})




@app.route('/sessions/<int:session_id>', methods=['PUT'])
@token_required
def update_session(current_user, session_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    title = data.get('title')
    date = data.get('date')
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    session_type = data.get('session_type', 'regular')
    
    if not title or not date or not start_time or not end_time:
        return jsonify({'error': 'Missing required fields: title, date, start_time, end_time'}), 400
    
    try:
        # Check for overlaps (excluding the current session being updated)
        overlapping = check_time_overlap(date, start_time, end_time, exclude_session_id=session_id)
        
        if overlapping:
            if session_type == 'blocked':
                # Delete overlapping regular sessions
                deleted_sessions = []
                with psycopg2.connect(POSTGRES_URL) as conn:
                    c = conn.cursor()
                    regular_sessions = [s for s in overlapping if s[4] != 'blocked']
                    for session in regular_sessions:
                        c.execute('DELETE FROM user_session WHERE session_id = %s', (session[0],))
                        c.execute('DELETE FROM session WHERE id = %s', (session[0],))
                        deleted_sessions.append(f"{session[1]} on {date}")
                    
                    # Update the current session
                    c.execute("UPDATE session SET title = %s, date = %s, start_time = %s, end_time = %s, session_type = %s WHERE id = %s",
                              (title, date, start_time, end_time, session_type, session_id))
                    conn.commit()
                
                response = {'message': 'Session updated successfully'}
                if deleted_sessions:
                    response['deleted'] = deleted_sessions
                    response['message'] += f', deleted {len(deleted_sessions)} overlapping sessions'
                return jsonify(response)
            else:
                # Check for blocked sessions preventing update
                blocked_sessions = [s for s in overlapping if s[4] == 'blocked']
                if blocked_sessions:
                    return jsonify({'error': 'Cannot update: Time slot is blocked for personal trainer usage'}), 400
                
                # Check for regular session overlaps
                regular_overlaps = [s for s in overlapping if s[4] != 'blocked']
                if regular_overlaps:
                    return jsonify({'error': f'Cannot update: Overlaps with existing session: {regular_overlaps[0][1]}'}), 400
        
        # No overlaps, proceed with update
        with psycopg2.connect(POSTGRES_URL) as conn:
            c = conn.cursor()
            c.execute("UPDATE session SET title = %s, date = %s, start_time = %s, end_time = %s, session_type = %s WHERE id = %s",
                      (title, date, start_time, end_time, session_type, session_id))
            conn.commit()
        
        return jsonify({'message': 'Session updated successfully'})
        
    except Exception as e:
        return jsonify({'error': f'Error updating session: {str(e)}'}), 500



# --- BULK SESSION DELETION ENDPOINTS ---
from dateutil.relativedelta import relativedelta

@app.route('/sessions/bulk', methods=['DELETE'])
@token_required
def delete_sessions_bulk(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json() or {}
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    trainer = data.get('trainer')
    session_type = data.get('session_type')
    series = data.get('series')
    filters = []
    params = []
    if start_date:
        filters.append('date >= %s')
        params.append(start_date)
    if end_date:
        filters.append('date <= %s')
        params.append(end_date)
    if trainer:
        filters.append('trainer = %s')
        params.append(trainer)
    if session_type:
        filters.append('session_type = %s')
        params.append(session_type)
    if series:
        filters.append('series = %s')
        params.append(series)
    where_clause = ('WHERE ' + ' AND '.join(filters)) if filters else ''
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        # Get session ids to delete
        c.execute(f'SELECT id FROM session {where_clause}', tuple(params))
        session_ids = [row[0] for row in c.fetchall()]
        if not session_ids:
            return jsonify({'message': 'No sessions found for deletion', 'deleted_count': 0})
        # Delete user_session links
        c.execute('DELETE FROM user_session WHERE session_id = ANY(%s)', (session_ids,))
        # Delete sessions
        c.execute('DELETE FROM session WHERE id = ANY(%s)', (session_ids,))
        deleted_count = c.rowcount
        conn.commit()
    return jsonify({'message': f'Deleted {deleted_count} sessions', 'deleted_count': deleted_count})

@app.route('/sessions/past', methods=['DELETE'])
@token_required
def delete_old_sessions(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    # Delete sessions older than 6 months from today
    cutoff = (datetime.date.today() - relativedelta(months=6)).isoformat()
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute('SELECT id FROM session WHERE date < %s', (cutoff,))
        session_ids = [row[0] for row in c.fetchall()]
        if not session_ids:
            return jsonify({'message': 'No old sessions found', 'deleted_count': 0})
        c.execute('DELETE FROM user_session WHERE session_id = ANY(%s)', (session_ids,))
        c.execute('DELETE FROM session WHERE id = ANY(%s)', (session_ids,))
        deleted_count = c.rowcount
        conn.commit()
    return jsonify({'message': f'Deleted {deleted_count} old sessions', 'deleted_count': deleted_count})

@app.route('/sessions/<int:session_id>', methods=['DELETE'])
@token_required
def delete_session(current_user, session_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        # Delete all user registrations for this session
        c.execute('DELETE FROM user_session WHERE session_id = %s', (session_id,))
        # Delete the session itself
        c.execute('DELETE FROM session WHERE id = %s', (session_id,))
        deleted_count = c.rowcount
        conn.commit()
        if deleted_count == 0:
            return jsonify({'error': 'Session not found or already deleted'}), 404
        print(f"[DELETE] Deleted session_id={session_id}, deleted_count={deleted_count}")
    return jsonify({'message': 'Session deleted successfully', 'deleted_count': deleted_count})

@app.route('/users/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(current_user, user_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        with psycopg2.connect(POSTGRES_URL) as conn:
            c = conn.cursor()
            
            # Check if user exists first
            c.execute('SELECT id, email FROM "user" WHERE id = %s', (user_id,))
            user = c.fetchone()
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            print(f"Attempting to delete user {user_id} ({user[1]})")
            
            # First, try to delete user's session registrations
            c.execute('SELECT COUNT(*) FROM user_session WHERE user_id = %s', (user_id,))
            session_count = c.fetchone()[0]
            print(f"User has {session_count} session registrations")
            
            if session_count > 0:
                c.execute('DELETE FROM user_session WHERE user_id = %s', (user_id,))
                print(f"Deleted {c.rowcount} user_session records")
            
            # Delete attendance records
            c.execute('DELETE FROM attendance WHERE user_id = %s', (user_id,))
            attendance_count = c.rowcount
            print(f"Deleted {attendance_count} attendance records")
            
            # Delete associated invite tokens
            c.execute('DELETE FROM invite_token WHERE email = %s', (user[1],))
            token_count = c.rowcount
            print(f"Deleted {token_count} invite tokens")
            
            # Delete the user
            c.execute('DELETE FROM "user" WHERE id = %s', (user_id,))
            deleted_count = c.rowcount
            print(f"Deleted {deleted_count} user records")
            
            if deleted_count == 0:
                return jsonify({'error': 'User not found or already deleted'}), 404
            
            conn.commit()
            print(f"Successfully deleted user {user_id}")
            
        return jsonify({'message': f'User {user[1]} deleted successfully'})
        
    except psycopg2.IntegrityError as e:
        print(f"Integrity error deleting user {user_id}: {str(e)}")
        return jsonify({'error': f'Cannot delete user due to data constraints: {str(e)}'}), 400
        
    except psycopg2.Error as e:
        print(f"Database error deleting user {user_id}: {str(e)}")
        return jsonify({'error': f'Database error: {str(e)}'}), 500
        
    except Exception as e:
        print(f"Unexpected error deleting user {user_id}: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@app.route('/profile', methods=['GET', 'PUT'])
@token_required
def user_profile(current_user):
    user_id = current_user['id']
    if request.method == 'GET':
        with psycopg2.connect(POSTGRES_URL) as conn:
            c = conn.cursor()
            c.execute('SELECT email, role, name FROM "user" WHERE id = %s', (user_id,))
            row = c.fetchone()
            if not row:
                return jsonify({'error': 'User not found'}), 404
            return jsonify({'email': row[0], 'role': row[1], 'name': row[2] or ''})
    elif request.method == 'PUT':
        data = request.json
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        with psycopg2.connect(POSTGRES_URL) as conn:
            c = conn.cursor()
            if email:
                c.execute('UPDATE "user" SET email = %s WHERE id = %s', (email, user_id))
            if password:
                hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
                c.execute('UPDATE "user" SET password = %s WHERE id = %s', (hashed_pw.decode('utf-8'), user_id))
            if name is not None:
                c.execute('UPDATE "user" SET name = %s WHERE id = %s', (name, user_id))
            conn.commit()
        return jsonify({'message': 'Profile updated'})

@app.route('/notifications', methods=['GET'])
@token_required
def get_notifications(current_user):
    # Example: return static notifications, replace with DB logic as needed
    return jsonify({'notifications': [
        {'id': 1, 'message': 'אימון חדש נוסף למערכת!', 'date': '2025-06-24'},
        {'id': 2, 'message': 'זכית בתג "נוכחות 10"!', 'date': '2025-06-20'}
    ]})

@app.route('/achievements', methods=['GET'])
@token_required
def get_achievements(current_user):
    # Example: return static achievements, replace with DB logic as needed
    return jsonify({'achievements': [
        {'id': 1, 'label': '10 אימונים', 'achieved': True},
        {'id': 2, 'label': 'רצף 5 ימים', 'achieved': False}
    ]})

@app.route('/user/sessions', methods=['GET'])
@token_required
def get_user_sessions(current_user):
    user_id = current_user['id']
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        try:
            # Try with new schema (date, start_time, end_time)
            c.execute('''
                SELECT s.id, s.date, s.start_time, s.end_time, s.title, s.session_type
                FROM session s
                JOIN user_session us ON s.id = us.session_id
                WHERE us.user_id = %s
                ORDER BY s.date ASC, s.start_time ASC
            ''', (user_id,))
            sessions = [
                {'id': row[0], 'date': str(row[1]), 'start_time': str(row[2]), 'end_time': str(row[3]), 'title': row[4], 'session_type': row[5] or 'regular'}
                for row in c.fetchall()
            ]
        except psycopg2.Error:
            # Fallback to old schema for backward compatibility
            try:
                c.execute('''
                    SELECT s.id, s.date, s.start_time, s.end_time, s.title
                    FROM session s
                    JOIN user_session us ON s.id = us.session_id
                    WHERE us.user_id = %s
                    ORDER BY s.date ASC, s.start_time ASC
                ''', (user_id,))
                sessions = [
                    {'id': row[0], 'date': str(row[1]), 'start_time': str(row[2]), 'end_time': str(row[3]), 'title': row[4], 'session_type': 'regular'}
                    for row in c.fetchall()
                ]
            except psycopg2.Error:
                # Final fallback for very old schema
                c.execute('''
                    SELECT s.id, s.date_time, s.title, COALESCE(s.location, '') as location
                    FROM session s
                    JOIN user_session us ON s.id = us.session_id
                    WHERE us.user_id = %s
                    ORDER BY s.date_time ASC
                ''', (user_id,))
                sessions = [
                    {'id': row[0], 'date_time': row[1], 'title': row[2], 'location': row[3], 'session_type': 'regular'}
                    for row in c.fetchall()
                ]
    return jsonify({'sessions': sessions})

@app.route('/sessions/<int:session_id>/register', methods=['POST'])
@token_required
def register_to_session_register(current_user, session_id):
    return _handle_session_registration(current_user, session_id)

@app.route('/invite-tokens', methods=['POST'])
@token_required
def create_invite_token(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.json
    import secrets
    token = data.get('token') or secrets.token_urlsafe(8)
    email = data.get('email')
    role = data.get('role', 'user')
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        try:
            c.execute('INSERT INTO invite_token (token, email, role) VALUES (%s, %s, %s)', (token, email, role))
            conn.commit()
            return jsonify({'token': token, 'email': email, 'role': role}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/invite-tokens', methods=['GET'])
@token_required
def list_invite_tokens(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute('SELECT id, token, email, role, used, created_at FROM invite_token ORDER BY created_at DESC')
        tokens = [
            {'id': row[0], 'token': row[1], 'email': row[2], 'role': row[3], 'used': row[4], 'created_at': row[5].isoformat()}
            for row in c.fetchall()
        ]
    return jsonify({'tokens': tokens})

# Delete individual invite token
@app.route('/invite-tokens/<int:token_id>', methods=['DELETE', 'OPTIONS'])
@token_required
def delete_invite_token(current_user, token_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        
        # Get token info before deletion
        c.execute('SELECT id, email, used FROM invite_token WHERE id = %s', (token_id,))
        token = c.fetchone()
        if not token:
            return jsonify({'error': 'Token not found'}), 404
        
        # Delete the token
        c.execute('DELETE FROM invite_token WHERE id = %s', (token_id,))
        conn.commit()
        
        return jsonify({
            'message': f'Token deleted successfully',
            'deleted_token': {
                'id': token[0],
                'email': token[1], 
                'was_used': token[2]
            }
        })

def check_time_overlap(date, start_time, end_time, exclude_session_id=None):
    """Check if there's any time overlap with existing sessions on the same date"""
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        
        # Convert times to comparable format
        query = '''
            SELECT id, title, start_time, end_time, session_type
            FROM session 
            WHERE date = %s 
            AND (
                (start_time < %s AND end_time > %s) OR  -- existing session overlaps with new session
                (start_time < %s AND end_time > %s) OR  -- new session overlaps with existing session
                (start_time >= %s AND end_time <= %s) OR -- existing session is within new session
                (start_time <= %s AND end_time >= %s)    -- new session is within existing session
            )
        '''
        params = [date, end_time, start_time, start_time, end_time, start_time, end_time, start_time, end_time]
        
        if exclude_session_id:
            query += ' AND id != %s'
            params.append(exclude_session_id)
            
        c.execute(query, params)
        return c.fetchall()

def handle_blocked_session_conflicts(date, start_time, end_time, session_type):
    """Handle conflicts when creating a blocked session"""
    if session_type == 'blocked':
        # Check for overlapping regular sessions
        overlapping = check_time_overlap(date, start_time, end_time)
        regular_sessions_to_delete = [s for s in overlapping if s[4] != 'blocked']
        
        if regular_sessions_to_delete:
            with psycopg2.connect(POSTGRES_URL) as conn:
                c = conn.cursor()
                for session in regular_sessions_to_delete:
                    # Delete user registrations first
                    c.execute('DELETE FROM user_session WHERE session_id = %s', (session[0],))
                    # Delete the session
                    c.execute('DELETE FROM session WHERE id = %s', (session[0],))
                conn.commit()
            
            deleted_titles = [s[1] for s in regular_sessions_to_delete]
            return {
                'deleted_sessions': deleted_titles,
                'message': f'Deleted {len(regular_sessions_to_delete)} overlapping regular sessions: {", ".join(deleted_titles)}'
            }
    
    return None

# Place this after app = Flask(__name__) and all configuration
@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    token = data.get('token')
    new_password = data.get('new_password')
    if not email or not token or not new_password:
        return jsonify({'error': 'Missing required fields'}), 400
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        # Check invite token
        c.execute('SELECT id, used, email FROM invite_token WHERE token = %s', (token,))
        row = c.fetchone()
        if not row:
            return jsonify({'error': 'Invalid token'}), 400
        if row[2] != email:
            return jsonify({'error': 'Token does not match email'}), 400
        # Check user exists
        c.execute('SELECT id FROM "user" WHERE email = %s', (email,))
        user_row = c.fetchone()
        if not user_row:
            return jsonify({'error': 'User not found'}), 404
        # Update password
        hashed_pw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        c.execute('UPDATE "user" SET password = %s WHERE id = %s', (hashed_pw.decode('utf-8'), user_row[0]))
        conn.commit()
    return jsonify({'message': 'Password reset successful'})

# --- SUBSCRIPTION MANAGEMENT ---
@app.route('/api/subscriptions', methods=['POST'])
@token_required
def create_subscription(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.json
    user_id = data.get('user_id')
    sub_type = data.get('type')
    
    if not user_id or not sub_type:
        return jsonify({'error': 'Missing user_id or type'}), 400
    
    # Calculate subscription parameters
    from datetime import datetime, timedelta
    now = datetime.now()
    
    if sub_type == 'monthly':
        end_time = now + timedelta(days=30)
        remaining_entries = None
    elif sub_type == 'one-time':
        end_time = None
        remaining_entries = 1
    elif sub_type == '5-entries':
        end_time = None
        remaining_entries = 5
    elif sub_type == '10-entries':
        end_time = None
        remaining_entries = 10
    else:
        return jsonify({'error': 'Invalid subscription type'}), 400
    
    try:
        with psycopg2.connect(POSTGRES_URL) as conn:
            c = conn.cursor()
            
            # Check if user exists
            c.execute('SELECT id FROM "user" WHERE id = %s', (user_id,))
            if not c.fetchone():
                return jsonify({'error': 'User not found'}), 404
            
            # Insert subscription
            c.execute('''
                INSERT INTO subscriptions (user_id, type, start_time, end_time, remaining_entries, is_active)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (user_id, sub_type, now, end_time, remaining_entries, True))
            
            conn.commit()
            return jsonify({'success': True, 'message': f'Subscription {sub_type} created successfully'}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/subscriptions/<int:user_id>', methods=['GET'])
@token_required
def get_user_subscriptions(current_user, user_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        with psycopg2.connect(POSTGRES_URL) as conn:
            c = conn.cursor()
            c.execute('''
                SELECT id, user_id, type, start_time, end_time, remaining_entries, is_active, created_at
                FROM subscriptions 
                WHERE user_id = %s 
                ORDER BY created_at DESC
            ''', (user_id,))
            
            rows = c.fetchall()
            subscriptions = []
            
            for row in rows:
                subscription = {
                    'id': row[0],
                    'user_id': row[1],
                    'type': row[2],
                    'start_time': row[3].isoformat() if row[3] else None,
                    'end_time': row[4].isoformat() if row[4] else None,
                    'remaining_entries': row[5],
                    'is_active': row[6],
                    'created_at': row[7].isoformat() if row[7] else None
                }
                subscriptions.append(subscription)
            
            return jsonify(subscriptions), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/subscriptions/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user_subscriptions(current_user, user_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    try:
        with psycopg2.connect(POSTGRES_URL) as conn:
            c = conn.cursor()
            
            # Delete all subscriptions for the user
            c.execute('DELETE FROM subscriptions WHERE user_id = %s', (user_id,))
            
            # Also delete all user session entries
            c.execute('DELETE FROM user_session WHERE user_id = %s', (user_id,))
            
            conn.commit()
            return jsonify({'success': True, 'message': 'All subscriptions and session entries deleted'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Helper functions for subscription validation ---
def _check_user_subscription(user_id, cursor):
    """Check if user has valid subscription for session registration"""
    from datetime import datetime
    
    # Get all active subscriptions for the user
    cursor.execute('''
        SELECT type, start_time, end_time, remaining_entries, is_active
        FROM subscriptions 
        WHERE user_id = %s AND is_active = TRUE
        ORDER BY created_at DESC
    ''', (user_id,))
    
    subscriptions = cursor.fetchall()
    
    if not subscriptions:
        return {'valid': False, 'message': 'No active subscriptions found. Please contact admin to activate a subscription.'}
    
    now = datetime.now()
    
    # Check each subscription
    for sub in subscriptions:
        sub_type, start_time, end_time, remaining_entries, is_active = sub
        
        if sub_type == 'monthly':
            # Check if within 30-day window
            if start_time <= now <= end_time:
                return {'valid': True, 'message': 'Valid monthly subscription'}
        
        elif sub_type in ['one-time', '5-entries', '10-entries']:
            # Check if has remaining entries
            if remaining_entries and remaining_entries > 0:
                return {'valid': True, 'message': f'Valid {sub_type} subscription with {remaining_entries} remaining'}
    
    return {'valid': False, 'message': 'No valid subscriptions found. Your subscriptions may have expired or run out of entries.'}

def _update_subscription_usage(user_id, cursor):
    """Update subscription usage after successful registration"""
    from datetime import datetime
    
    # Get the most recent active subscription that has remaining entries
    cursor.execute('''
        SELECT id, type, remaining_entries
        FROM subscriptions 
        WHERE user_id = %s AND is_active = TRUE AND remaining_entries > 0
        ORDER BY created_at DESC
        LIMIT 1
    ''', (user_id,))
    
    sub = cursor.fetchone()
    
    if sub:
        sub_id, sub_type, remaining_entries = sub
        
        if sub_type in ['one-time', '5-entries', '10-entries']:
            new_remaining = remaining_entries - 1
            
            if new_remaining <= 0:
                # Deactivate subscription when no entries left
                cursor.execute('''
                    UPDATE subscriptions 
                    SET remaining_entries = %s, is_active = FALSE
                    WHERE id = %s
                ''', (new_remaining, sub_id))
            else:
                # Update remaining entries
                cursor.execute('''
                    UPDATE subscriptions 
                    SET remaining_entries = %s
                    WHERE id = %s
                ''', (new_remaining, sub_id))

if __name__ == "__main__":
    from os import environ
    print(f"[STARTUP] POSTGRES_URL: {POSTGRES_URL}")
    # Try connecting to the database and print any errors
    try:
        create_tables()
        add_session_type_column()
        with psycopg2.connect(POSTGRES_URL) as conn:
            print("[STARTUP] Successfully connected to Postgres!")
    except Exception as e:
        print(f"[STARTUP] Failed to connect to Postgres: {e}")
    app.run(host='0.0.0.0', port=int(environ.get("PORT", 5000)))