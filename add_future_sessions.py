import psycopg2
from datetime import datetime, timedelta

POSTGRES_URL = 'postgresql://neondb_owner:npg_lIAkyD8Ldn4U@ep-ancient-term-a6p32xv9-pooler.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

try:
    with psycopg2.connect(POSTGRES_URL) as conn:
        c = conn.cursor()
        
        print('🔧 Adding FUTURE sessions for August 2025...')
        
        # Add sessions for the next few days (August 2025)
        today = datetime.now().date()
        tomorrow = today + timedelta(days=1)
        day_after = today + timedelta(days=2)
        day_three = today + timedelta(days=3)
        day_four = today + timedelta(days=4)
        
        future_sessions = [
            (tomorrow, '09:00', '10:00', 'Morning Strength Training', 'strength', 'Main Gym'),
            (tomorrow, '18:00', '19:00', 'Evening Cardio Session', 'cardio', 'Cardio Room'),
            (tomorrow, '20:00', '21:00', 'Night Yoga Class', 'yoga', 'Studio A'),
            
            (day_after, '07:00', '08:00', 'Early Bird Workout', 'general', 'Main Gym'),
            (day_after, '12:00', '13:00', 'Lunch Break Fitness', 'cardio', 'Cardio Room'),
            (day_after, '16:00', '17:00', 'Afternoon Strength', 'strength', 'Main Gym'),
            
            (day_three, '10:00', '11:00', 'Mid-Morning Session', 'yoga', 'Studio A'),
            (day_three, '15:00', '16:00', 'Afternoon Cardio', 'cardio', 'Cardio Room'),
            
            (day_four, '08:00', '09:00', 'Weekend Morning Session', 'general', 'Main Gym'),
            (day_four, '19:00', '20:00', 'Weekend Evening Session', 'strength', 'Main Gym'),
        ]
        
        added_count = 0
        for session in future_sessions:
            c.execute('''
                INSERT INTO session (date, start_time, end_time, title, session_type, location)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', session)
            added_count += 1
        
        conn.commit()
        print(f'✅ Added {added_count} future sessions!')
        
        # Show the new future sessions
        print('📋 New future sessions:')
        c.execute('''
            SELECT id, date, start_time, title, location 
            FROM session 
            WHERE date >= %s 
            ORDER BY date, start_time
        ''', (today,))
        
        future_sessions_result = c.fetchall()
        for session in future_sessions_result:
            print(f'  - ID: {session[0]}, Date: {session[1]}, Time: {session[2]}, Title: {session[3]}, Location: {session[4]}')
        
        print(f'📈 Total future sessions: {len(future_sessions_result)}')
            
except Exception as e:
    print(f'❌ Error: {e}')
