import psycopg2
from datetime import datetime
import os
from dotenv import load_dotenv
load_dotenv()

def migrate_subscriptions():
    POSTGRES_URL = os.getenv('POSTGRES_URL') or os.getenv('DATABASE_URL')
    
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        
        # Create subscriptions table
        c.execute('''
        CREATE TABLE IF NOT EXISTS subscriptions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
            type TEXT NOT NULL, -- 'monthly', 'one-time', '5-entries', '10-entries'
            start_time TIMESTAMP NOT NULL,
            end_time TIMESTAMP,
            remaining_entries INTEGER,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        conn.commit()
        print("✅ Migration complete: subscriptions table created.")

if __name__ == "__main__":
    migrate_subscriptions()
