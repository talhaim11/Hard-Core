import psycopg2
import os
from dotenv import load_dotenv
load_dotenv()

POSTGRES_URL = os.getenv('POSTGRES_URL')
with psycopg2.connect(POSTGRES_URL) as conn:
    c = conn.cursor()
    print('=== CURRENT USERS ===')
    c.execute('SELECT id, email, role FROM "user" ORDER BY id')
    users = c.fetchall()
    for user in users:
        print(f'User: {user}')
    
    print('\n=== CURRENT TOKENS ===')
    c.execute('SELECT id, email, role, used FROM invite_token ORDER BY id')
    tokens = c.fetchall()
    for token in tokens:
        print(f'Token: {token}')
