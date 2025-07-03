import psycopg2
import os
from dotenv import load_dotenv
load_dotenv()

POSTGRES_URL = os.getenv('POSTGRES_URL')

with psycopg2.connect(POSTGRES_URL) as conn:
    c = conn.cursor()
    c.execute('SELECT id, email, role FROM "user" ORDER BY id')
    rows = c.fetchall()
    print(f"Found {len(rows)} users:")
    for row in rows:
        print(f'ID: {row[0]}, Email: {row[1]}, Role: {row[2]}')
        
    # Specifically check for talhaim11
    c.execute('SELECT id, email, role FROM "user" WHERE email = %s', ('talhaim11',))
    row = c.fetchone()
    if row:
        print(f"\nFound talhaim11: ID={row[0]}, Role={row[2]}")
    else:
        print("\ntalhaim11 not found")
