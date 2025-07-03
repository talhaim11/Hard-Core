import psycopg2
import bcrypt
import os
from dotenv import load_dotenv
load_dotenv()

POSTGRES_URL = os.getenv('POSTGRES_URL')

def create_user(email, password, role):
    """Create a user with bcrypt hashed password"""
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        try:
            c.execute('INSERT INTO "user" (email, password, role) VALUES (%s, %s, %s)', 
                     (email, hashed_pw.decode('utf-8'), role))
            conn.commit()
            print(f"✅ Created user: {email} with role: {role}")
            return True
        except Exception as e:
            print(f"❌ Error creating user {email}: {e}")
            return False

# Create the users that have used invite tokens
print("Creating users based on used invite tokens...")

# Create talhaim11 (admin) - the one you're trying to log in with
# You need to provide the password you want to use
password_for_talhaim11 = input("Enter password for talhaim11: ")
create_user("talhaim11", password_for_talhaim11, "admin")

# Create other users if you want
print("\nDo you want to create other users from the invite tokens?")
create_others = input("Create others? (y/n): ").lower() == 'y'

if create_others:
    # Create itay (admin)
    itay_password = input("Enter password for itay: ")
    create_user("itay", itay_password, "admin")
    
    # Create Alma@july.com (user)
    alma_password = input("Enter password for Alma@july.com: ")
    create_user("Alma@july.com", alma_password, "user")
    
    # Create test (user)
    test_password = input("Enter password for test: ")
    create_user("test", test_password, "user")

# Verify the users were created
print("\nVerifying created users:")
with psycopg2.connect(POSTGRES_URL) as conn:
    c = conn.cursor()
    c.execute('SELECT id, email, role FROM "user" ORDER BY id')
    rows = c.fetchall()
    for row in rows:
        print(f"✅ ID: {row[0]}, Email: {row[1]}, Role: {row[2]}")
