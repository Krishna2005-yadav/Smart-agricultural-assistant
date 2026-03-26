import sqlite3

def migrate():
    print("Starting migration...")
    try:
        with sqlite3.connect('database.db') as conn:
            # Add is_admin column
            try:
                conn.execute('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0')
                print("Added is_admin column.")
            except sqlite3.OperationalError as e:
                print(f"Column might already exist: {e}")

            # Set user ID 2 as admin (change this ID if you want a different admin)
            # If ID 2 doesn't exist, we can try to set the first user as admin
            cursor = conn.execute('SELECT id, username FROM users')
            users = cursor.fetchall()
            print(f"Found users: {users}")
            
            target_admin_id = 2
            
            # Check if user 2 exists
            user_2 = next((u for u in users if u[0] == 2), None)
            
            if user_2:
                conn.execute('UPDATE users SET is_admin = 1 WHERE id = ?', (target_admin_id,))
                print(f"User {user_2[1]} (ID: {target_admin_id}) is now an admin.")
            elif users:
                # Fallback: Make the first user admin if ID 2 not found
                first_user = users[0]
                conn.execute('UPDATE users SET is_admin = 1 WHERE id = ?', (first_user[0],))
                print(f"User ID 2 not found. User {first_user[1]} (ID: {first_user[0]}) is now an admin.")
            else:
                print("No users found in database.")
                
            conn.commit()
            print("Migration complete.")
            
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
