import psycopg2
import os
from dotenv import load_dotenv
load_dotenv()

POSTGRES_URL = os.getenv('POSTGRES_URL')
with psycopg2.connect(POSTGRES_URL) as conn:
    c = conn.cursor()
    c.execute('SELECT id, email, role, password FROM "user" WHERE email LIKE %s', ('%talhaim%',))
    rows = c.fetchall()
    for row in rows:
        print(f'ID: {row[0]}, Email: {row[1]}, Role: {row[2]}, Password Hash: {row[3][:50]}...')
