import sqlite3
import bcrypt
import json
import os

DB_PATH = 'database.sqlite'

def seed():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Default password for all seeded users
    password = "password123"
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    users = [
        ('Harsha', 'harsha@srm.edu', 'Machine Learning', 'JavaScript'),
        ('Hariharan', 'hari@srm.edu', 'Web Development', 'React'),
        ('Satish', 'satish@srm.edu', 'Java', 'Web Dev'),
        ('Sri Ram', 'sriram@srm.edu', 'Java', 'Node.js')
    ]
    
    for name, email, teaches, wants in users:
        try:
            cursor.execute('''
                INSERT INTO users (name, email, password, teach_skills, learn_skills)
                VALUES (?, ?, ?, ?, ?)
            ''', (name, email, hashed, json.dumps([teaches]), json.dumps([wants])))
            print(f"Seeded user: {name} ({email})")
        except sqlite3.IntegrityError:
            print(f"User {name} already exists.")
            
    conn.commit()
    conn.close()
    print("\nSeeding complete! Default password for all users is: password123")

if __name__ == "__main__":
    seed()
