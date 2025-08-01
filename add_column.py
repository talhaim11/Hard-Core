#!/usr/bin/env python3

import psycopg2
from os import environ
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

POSTGRES_URL = environ.get('POSTGRES_URL')
if not POSTGRES_URL:
    print("❌ POSTGRES_URL not found in environment variables")
    exit(1)

print(f"🔗 Connecting to: {POSTGRES_URL}")

def add_can_block_sessions_column():
    try:
        with psycopg2.connect(POSTGRES_URL) as conn:
            c = conn.cursor()
            
            # Check if column already exists
            c.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='user' AND column_name='can_block_sessions'
            """)
            
            if c.fetchone():
                print("ℹ️ Column 'can_block_sessions' already exists.")
                return
            
            # Add the column
            c.execute('ALTER TABLE "user" ADD COLUMN can_block_sessions BOOLEAN DEFAULT FALSE')
            conn.commit()
            print("✅ Column 'can_block_sessions' added successfully.")
            
    except psycopg2.Error as e:
        print(f"💥 Database error: {str(e)}")
    except Exception as e:
        print(f"💥 Unexpected error: {str(e)}")

if __name__ == "__main__":
    add_can_block_sessions_column()
