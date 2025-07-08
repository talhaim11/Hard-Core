import psycopg2
import bcrypt
import os
from dotenv import load_dotenv
load_dotenv()

POSTGRES_URL = os.getenv('POSTGRES_URL')

# Reset itay's password to something we know
email = "itay"
new_password = "123456"

hashed_pw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())

with psycopg2.connect(POSTGRES_URL) as conn:
    c = conn.cursor()
    try:
        # Update user's password
        c.execute('UPDATE "user" SET password = %s WHERE email = %s', 
                 (hashed_pw.decode('utf-8'), email))
        conn.commit()
        print(f"✅ Successfully updated password for user: {email}")
        
        # Verify the user exists
        c.execute('SELECT id, email, role FROM "user" WHERE email = %s', (email,))
        row = c.fetchone()
        if row:
            print(f"✅ Verified: ID={row[0]}, Email={row[1]}, Role={row[2]}")
        else:
            print("❌ User not found")
            
    except Exception as e:
        print(f"❌ Error updating user: {e}")
