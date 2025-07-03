import psycopg2
import bcrypt
import os
from dotenv import load_dotenv
load_dotenv()

POSTGRES_URL = os.getenv('POSTGRES_URL')

def test_login(email, password):
    print(f"Testing login for: {email}")
    
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        # Test the exact query from your login function
        c.execute('SELECT id, password, role FROM "user" WHERE email = %s OR email = %s', (email, email))
        row = c.fetchone()
        
        if row:
            print(f"User found - ID: {row[0]}, Role: {row[2]}")
            db_hash = row[1]
            print(f"DB hash type: {type(db_hash)}")
            print(f"DB hash (first 50 chars): {str(db_hash)[:50]}...")
            
            # Test password verification
            try:
                if isinstance(db_hash, str):
                    check_result = bcrypt.checkpw(password.encode('utf-8'), db_hash.encode('utf-8'))
                else:
                    check_result = bcrypt.checkpw(password.encode('utf-8'), db_hash)
                print(f"Password check result: {check_result}")
                return check_result
            except Exception as e:
                print(f"Error during password check: {e}")
                return False
        else:
            print("User not found")
            return False

# Test with the account from your screenshot
test_login("talhaim11", "your_password_here")

# Also test the other account
test_login("talhaim", "your_password_here")
