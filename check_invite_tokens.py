import psycopg2
import os
from dotenv import load_dotenv
load_dotenv()

POSTGRES_URL = os.getenv('POSTGRES_URL')

with psycopg2.connect(POSTGRES_URL) as conn:
    c = conn.cursor()
    
    # Check invite_token table structure and data
    c.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'invite_token' AND table_schema = 'public'
        ORDER BY ordinal_position
    """)
    columns = c.fetchall()
    print("invite_token table structure:")
    for col in columns:
        print(f"  - {col[0]}: {col[1]}")
    
    print("\ninvite_token table data:")
    c.execute('SELECT * FROM invite_token ORDER BY id')
    rows = c.fetchall()
    for row in rows:
        print(f"ID: {row[0]}, Token: {row[1]}, Email: {row[2]}, Role: {row[3]}, Used: {row[4]}, Created: {row[5]}")
        
    # Check if any invite tokens are for talhaim11
    c.execute('SELECT * FROM invite_token WHERE email LIKE %s', ('%talhaim%',))
    talhaim_tokens = c.fetchall()
    print(f"\nTokens for talhaim accounts: {len(talhaim_tokens)}")
    for token in talhaim_tokens:
        print(f"  - {token}")
