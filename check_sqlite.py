import sqlite3
import os

db_path = r"c:\Users\talha\Downloads\Hard-core gym attendance\gym.db"
if os.path.exists(db_path):
    print(f"SQLite database exists at: {db_path}")
    try:
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        
        # Check tables
        c.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = c.fetchall()
        print(f"SQLite tables: {[t[0] for t in tables]}")
        
        # Check user table if it exists
        if any('user' in str(t).lower() for t in tables):
            for table in tables:
                table_name = table[0]
                if 'user' in table_name.lower():
                    print(f"\nChecking table: {table_name}")
                    c.execute(f"SELECT COUNT(*) FROM {table_name}")
                    count = c.fetchone()[0]
                    print(f"  Row count: {count}")
                    
                    if count > 0:
                        c.execute(f"PRAGMA table_info({table_name})")
                        columns = c.fetchall()
                        print(f"  Columns: {[col[1] for col in columns]}")
                        
                        c.execute(f"SELECT * FROM {table_name} LIMIT 5")
                        rows = c.fetchall()
                        for i, row in enumerate(rows):
                            print(f"  Row {i+1}: {row}")
        
        conn.close()
    except Exception as e:
        print(f"Error reading SQLite: {e}")
else:
    print("SQLite database not found")
