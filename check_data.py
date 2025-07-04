import psycopg2
import os
from dotenv import load_dotenv
load_dotenv()

POSTGRES_URL = os.getenv('POSTGRES_URL') or os.getenv('DATABASE_URL')
with psycopg2.connect(POSTGRES_URL) as conn:
    c = conn.cursor()
    print('=== USERS TABLE ===')
    c.execute('SELECT * FROM "user" LIMIT 5')
    col_names = [desc[0] for desc in c.description]
    print('Columns:', col_names)
    for row in c.fetchall():
        print('Row:', row)
        
    print('\n=== SUBSCRIPTIONS TABLE ===')
    c.execute('SELECT s.*, u.email FROM subscriptions s JOIN "user" u ON s.user_id = u.id LIMIT 10')
    col_names = [desc[0] for desc in c.description]
    print('Columns:', col_names)
    for row in c.fetchall():
        print('Row:', row)
