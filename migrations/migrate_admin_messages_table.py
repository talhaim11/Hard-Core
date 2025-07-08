#!/usr/bin/env python3
"""
Migration script to update admin_messages table structure
from title/message/start_time/end_time format to content/duration_hours format
"""

import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

POSTGRES_URL = os.getenv('DATABASE_URL', os.getenv('POSTGRES_URL'))

def migrate_admin_messages_table():
    """Update admin_messages table structure"""
    try:
        with psycopg2.connect(POSTGRES_URL) as conn:
            cur = conn.cursor()
            
            # Check if table exists and what columns it has
            cur.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'admin_messages'
            """)
            existing_columns = [row[0] for row in cur.fetchall()]
            
            if not existing_columns:
                print("No admin_messages table found, will be created by main app")
                return
                
            print(f"Found existing columns: {existing_columns}")
            
            # Drop the old table and recreate with new structure
            print("Dropping old admin_messages table...")
            cur.execute('DROP TABLE IF EXISTS admin_messages CASCADE')
            
            print("Creating new admin_messages table...")
            cur.execute('''
                CREATE TABLE admin_messages (
                    id SERIAL PRIMARY KEY,
                    content TEXT NOT NULL,
                    priority VARCHAR(20) DEFAULT 'normal',
                    duration_hours INTEGER DEFAULT 24,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by INTEGER REFERENCES "user"(id)
                )
            ''')
            
            conn.commit()
            print("✅ admin_messages table migration completed successfully!")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise

if __name__ == "__main__":
    migrate_admin_messages_table()
