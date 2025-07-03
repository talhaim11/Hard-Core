import psycopg2
import os
from dotenv import load_dotenv
load_dotenv()

POSTGRES_URL = os.getenv('POSTGRES_URL')
print(f"Database URL: {POSTGRES_URL[:30]}...")

try:
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        c.execute('SELECT id, email, role FROM "user"')
        rows = c.fetchall()
        print(f"Found {len(rows)} users:")
        for row in rows:
            print(f'ID: {row[0]}, Email: {row[1]}, Role: {row[2]}')
except Exception as e:
    print(f"Error: {e}")
