from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
import bcrypt
import jwt
import datetime
from dotenv import load_dotenv
load_dotenv()
from functools import wraps
import sys

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
              'role': data['role']  # <-- fixed line
            }
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401

        return f(current_user, *args, **kwargs)
    return decorated




# --- CONFIGURATION ---
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
db = SQLAlchemy(app)
print("🚀 Flask is starting...")

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# --- MODELS ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    role = db.Column(db.String, default='user', nullable=False)

class AllowedToken(db.Model):
    token = db.Column(db.String, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date_time = db.Column(db.String, unique=True, nullable=False)
    title = db.Column(db.String)
    location = db.Column(db.String)

class UserSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey('session.id'), nullable=False)
    __table_args__ = (db.UniqueConstraint('user_id', 'session_id'),)

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.String, nullable=False)
    hour = db.Column(db.Integer, nullable=False)
    note = db.Column(db.String)
    __table_args__ = (db.UniqueConstraint('user_id', 'date', 'hour'),)

with app.app_context():
    db.create_all()

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

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    try:
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 409
        if AllowedToken.query.filter((AllowedToken.token == token) | (AllowedToken.email == email)).first():
            return jsonify({'error': 'Token or email already used'}), 409

        user = User(email=email, password=hashed_pw, role=role)
        allowed_token = AllowedToken(token=token, email=email)
        db.session.add(user)
        db.session.add(allowed_token)
        db.session.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 400

@app.route('/login', methods=['POST'])
def login():
    print("DEBUG: /login route called", file=sys.stderr, flush=True)
    data = request.json
    email = data.get('email')
    password = data.get('password')
    token = data.get('token')

    allowed = AllowedToken.query.filter_by(token=token).first()
    print(f"DEBUG: allowed_tokens row for token={token}: {allowed}", file=sys.stderr, flush=True)
    print(f"DEBUG: login email from request: '{email}'", file=sys.stderr, flush=True)
    if not allowed or allowed.email.strip().lower() != email.strip().lower():
        print("DEBUG: Token not found in allowed_tokens or email mismatch", file=sys.stderr, flush=True)
        return jsonify({'error': 'Invalid token or email'}), 401

    user = User.query.filter_by(email=email).first()
    print(f"DEBUG: users row for email={email}: {user}", file=sys.stderr, flush=True)
    if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        token_jwt = encode_token(str(user.id), user.role)
        return jsonify({'token': token_jwt, 'role': user.role})
    print("DEBUG: Invalid credentials", file=sys.stderr, flush=True)
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/users', methods=['GET'])
def get_users():
    with db.session.no_autoflush:
        users = User.query.all()
    return jsonify([{'id': user.id, 'email': user.email, 'role': user.role} for user in users])

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

    with db.session.no_autoflush:
        # הכנס את האימון אם הוא לא קיים
        session = Session.query.filter_by(date_time=date_time).first()
        if not session:
            session = Session(date_time=date_time)
            db.session.add(session)
            db.session.commit()

        # נסה לרשום את המשתמש לאימון
        user_session = UserSession.query.filter_by(user_id=user_id, session_id=session.id).first()
        if user_session:
            return jsonify({'error': 'Already registered for this session'}), 409

        user_session = UserSession(user_id=user_id, session_id=session.id)
        db.session.add(user_session)
        db.session.commit()

    return jsonify({'message': 'Session booked successfully'})

@app.route('/sessions', methods=['GET'])
def get_sessions():
    with db.session.no_autoflush:
        sessions = (
            db.session.query(Session, db.func.count(UserSession.user_id).label('participant_count'))
            .outerjoin(UserSession, Session.id == UserSession.session_id)
            .group_by(Session.id, Session.date_time)
            .order_by(Session.date_time.asc())
            .all()
        )
    return jsonify([
        {'id': session[0].id, 'date_time': session[0].date_time, 'participants': session.participant_count}
        for session in sessions
    ])

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

    session = Session(title=title, date_time=date_time, location=location)
    db.session.add(session)
    db.session.commit()

    return jsonify({'message': 'Session created successfully'}), 201


@app.route('/sessions/<int:session_id>', methods=['GET'])
def get_session_details(session_id):
    with db.session.no_autoflush:
        users = (
            db.session.query(User)
            .join(UserSession, User.id == UserSession.user_id)
            .filter(UserSession.session_id == session_id)
            .all()
        )
    return jsonify([{'id': user.id, 'email': user.email, 'role': user.role} for user in users])

@app.route('/sessions/<int:session_id>', methods=['DELETE'])
@token_required
def cancel_registration(current_user, session_id):
    with db.session.no_autoflush:
        user_session = UserSession.query.filter_by(user_id=current_user['id'], session_id=session_id).first()
        if user_session:
            db.session.delete(user_session)
            db.session.commit()
            return jsonify({'message': 'Registration cancelled successfully'})
        return jsonify({'error': 'Registration not found'}), 404
 
@app.route('/sessions/<int:session_id>', methods=['POST'])
@token_required
def register_to_session(current_user, session_id):
    with db.session.no_autoflush:
        # בדיקה אם המשתמש כבר רשום
        user_session = UserSession.query.filter_by(user_id=current_user['id'], session_id=session_id).first()
        if user_session:
            return jsonify({'message': 'Already registered for this session'}), 200

        # רישום חדש
        user_session = UserSession(user_id=current_user['id'], session_id=session_id)
        db.session.add(user_session)
        db.session.commit()

    return jsonify({'message': 'Registered successfully'})

@app.route('/debug_users', methods=['GET'])
def debug_users():
    with db.session.no_autoflush:
        users = User.query.all()
    return jsonify({'users': [{'id': user.id, 'email': user.email} for user in users]})

@app.route('/debug_sessions', methods=['GET'])
def debug_sessions():
    with db.session.no_autoflush:
        sessions = Session.query.all()
    return jsonify({'sessions': [{'id': session.id, 'date_time': session.date_time} for session in sessions]})

@app.route('/debug_user_sessions', methods=['GET'])
def debug_user_sessions():
    with db.session.no_autoflush:
        user_sessions = (
            db.session.query(UserSession, User, Session)
            .join(User, User.id == UserSession.user_id)
            .join(Session, Session.id == UserSession.session_id)
            .all()
        )
    return jsonify({
        'user_sessions': [{
            'id': us[0].id,
            'user_email': us[1].email,
            'session_date_time': us[2].date_time
        } for us in user_sessions]
    })

@app.route('/debug', methods=['GET'])
def debug():
    with db.session.no_autoflush:
        # For PostgreSQL, use information_schema to list tables
        tables = db.session.execute(
            "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
        ).fetchall()
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
    with db.session.no_autoflush:
        tokens = AllowedToken.query.all()
    return jsonify({token.token: token.email for token in tokens})

@app.route('/debug_secret_key', methods=['GET'])
def debug_secret_key():
    return jsonify({'secret_key': app.config['SECRET_KEY']})


@app.route('/debug_env', methods=['GET'])
def debug_env():
    env_vars = {key: value for key, value in os.environ.items() if key.startswith('DEBUG_')}
    return jsonify(env_vars)

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
    with db.session.no_autoflush:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        db.session.delete(user)
        db.session.commit()
    return jsonify({'message': 'User deleted successfully'})

@app.route('/attendance', methods=['GET'])
@token_required
def get_attendance(current_user):
    # Get attendance for the next 2 weeks for all users
    today = datetime.date.today()
    start = today - datetime.timedelta(days=today.weekday()+1)  # Sunday of this week
    end = start + datetime.timedelta(days=13)  # 2 weeks
    with db.session.no_autoflush:
        records = (
            db.session.query(Attendance, User)
            .join(User, User.id == Attendance.user_id)
            .filter(db.func.date(Attendance.date) >= start, db.func.date(Attendance.date) <= end)
            .all()
        )
    # Group by date and hour
    attendance = {}
    for record in records:
        date = record.Attendance.date
        hour = record.Attendance.hour
        note = record.Attendance.note
        email = record.User.email
        user_id = record.User.id
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
    with db.session.no_autoflush:
        attendance_record = Attendance.query.filter_by(user_id=user_id, date=date, hour=hour).first()
        if attendance_record:
            attendance_record.note = note
        else:
            attendance_record = Attendance(user_id=user_id, date=date, hour=hour, note=note)
            db.session.add(attendance_record)
        db.session.commit()
    return jsonify({'message': 'Attendance updated'})


if __name__ == "__main__":
    from os import environ
    app.run(host='0.0.0.0', port=int(environ.get("PORT", 5000)))