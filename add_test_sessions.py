import psycopg2
from datetime import datetime, timedelta

POSTGRES_URL = 'postgresql://neondb_owner:npg_lIAkyD8Ldn4U@ep-ancient-term-a6p32xv9-pooler.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

try:
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        
        # Check current session count
        c.execute('SELECT COUNT(*) FROM session')
        count = c.fetchone()[0]
        print(f'📊 Current session count: {count}')
        
        if count == 0:
            print('🔧 Adding test sessions...')
            
            # Add some future sessions
            tomorrow = (datetime.now() + timedelta(days=1)).date()
            day_after = (datetime.now() + timedelta(days=2)).date()
            day_three = (datetime.now() + timedelta(days=3)).date()
            
            test_sessions = [
                (tomorrow, '09:00', '10:00', 'Morning Workout', 'strength', 'Main Gym'),
                (tomorrow, '18:00', '19:00', 'Evening Cardio', 'cardio', 'Cardio Room'),
                (day_after, '07:00', '08:00', 'Early Bird Yoga', 'yoga', 'Studio A'),
                (day_after, '16:00', '17:00', 'Strength Training', 'strength', 'Main Gym'),
                (day_three, '12:00', '13:00', 'Lunch Break Fitness', 'general', 'Outdoor Area'),
            ]
            
            for session in test_sessions:
                c.execute('''
                    INSERT INTO session (date, start_time, end_time, title, session_type, location)
                    VALUES (%s, %s, %s, %s, %s, %s)
                ''', session)
            
            conn.commit()
            print('✅ Added 5 test sessions!')
        else:
            print('📋 Existing sessions found:')
            c.execute('SELECT id, date, start_time, title FROM session ORDER BY date, start_time LIMIT 10')
            sessions = c.fetchall()
            for session in sessions:
                print(f'  - ID: {session[0]}, Date: {session[1]}, Time: {session[2]}, Title: {session[3]}')
        
        # Show final count
        c.execute('SELECT COUNT(*) FROM session')
        final_count = c.fetchone()[0]
        print(f'📈 Final session count: {final_count}')
            
except Exception as e:
    print(f'❌ Error: {e}')
