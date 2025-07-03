import psycopg2
import bcrypt
import os
from dotenv import load_dotenv
load_dotenv()

POSTGRES_URL = os.getenv('POSTGRES_URL')

# Create talhaim11 user with a specific password
email = "talhaim11"
password = "admin123"  # Change this to your preferred password
role = "admin"

hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

with psycopg2.connect(POSTGRES_URL) as conn:
    c = conn.cursor()
    try:
        c.execute('INSERT INTO "user" (email, password, role) VALUES (%s, %s, %s)', 
                 (email, hashed_pw.decode('utf-8'), role))
        conn.commit()
        print(f"✅ Successfully created user: {email} with role: {role}")
        
        # Verify it was created
        c.execute('SELECT id, email, role FROM "user" WHERE email = %s', (email,))
        row = c.fetchone()
        if row:
            print(f"✅ Verified: ID={row[0]}, Email={row[1]}, Role={row[2]}")
        else:
            print("❌ User not found after creation")
            
    except Exception as e:
        print(f"❌ Error creating user: {e}")
