import psycopg2
import os
from dotenv import load_dotenv
load_dotenv()

POSTGRES_URL = os.getenv('POSTGRES_URL')
print(f"Connecting to: {POSTGRES_URL}")

with psycopg2.connect(POSTGRES_URL) as conn:
    c = conn.cursor()
    
    # Check what tables exist
    c.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    tables = c.fetchall()
    print("Tables in database:")
    for table in tables:
        print(f"  - {table[0]}")
    
    # Check if there's data in each table
    for table in tables:
        table_name = table[0]
        try:
            c.execute(f'SELECT COUNT(*) FROM "{table_name}"')
            count = c.fetchone()[0]
            print(f"  {table_name}: {count} rows")
        except Exception as e:
            print(f"  {table_name}: Error - {e}")
            
    # Check if user table exists but is empty
    c.execute('SELECT COUNT(*) FROM "user"')
    user_count = c.fetchone()[0]
    print(f"\nUser table has {user_count} rows")
    
    # Try to see the structure
    c.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'user' AND table_schema = 'public'
        ORDER BY ordinal_position
    """)
    columns = c.fetchall()
    print("User table structure:")
    for col in columns:
        print(f"  - {col[0]}: {col[1]}")
