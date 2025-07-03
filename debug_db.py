import psycopg2
import os
from dotenv import load_dotenv
load_dotenv()

POSTGRES_URL = os.getenv('POSTGRES_URL')
print(f"Database URL: {POSTGRES_URL[:30]}...")

try:
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        
        # Check what tables exist
        c.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
        tables = c.fetchall()
        print(f"Available tables: {[t[0] for t in tables]}")
        
        # Try different table name possibilities
        possible_names = ['user', 'users', 'User', 'Users']
        for name in possible_names:
            try:
                c.execute(f'SELECT COUNT(*) FROM "{name}"')
                count = c.fetchone()[0]
                print(f'Table "{name}" has {count} rows')
                
                if count > 0:
                    c.execute(f'SELECT id, email, role FROM "{name}" LIMIT 5')
                    rows = c.fetchall()
                    for row in rows:
                        print(f'  ID: {row[0]}, Email: {row[1]}, Role: {row[2]}')
            except Exception as e:
                print(f'Table "{name}" does not exist or error: {str(e)[:50]}')
                
except Exception as e:
    print(f"Connection error: {e}")
