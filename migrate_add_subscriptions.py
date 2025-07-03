import sqlite3
from datetime import datetime

def migrate_subscriptions():
    conn = sqlite3.connect('gym.db')
    c = conn.cursor()
    
    # Create subscriptions table
    c.execute('''
    CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL, -- 'monthly', 'one-time', '5-entries', '10-entries'
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        remaining_entries INTEGER,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()
    print("Migration complete: subscriptions table created.")

if __name__ == "__main__":
    migrate_subscriptions()
