import psycopg2
import psycopg2.extras
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    if not DATABASE_URL:
        print("Error: DATABASE_URL not set in environment.")
        return None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.cursor_factory = psycopg2.extras.DictCursor
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def fetch_contacts(resolved=False):
    conn = get_db_connection()
    if not conn: return []
    
    c = conn.cursor()
    # 0 is unresolved, 1 is resolved
    status = 1 if resolved else 0
    c.execute('SELECT * FROM contact_submissions WHERE issue_resolved = %s ORDER BY timestamp DESC', (status,))
    submissions = c.fetchall()
    conn.close()
    return submissions

def resolve_contact(contact_id):
    conn = get_db_connection()
    if not conn: return False
    c = conn.cursor()
    c.execute('UPDATE contact_submissions SET issue_resolved = 1 WHERE id = %s', (contact_id,))
    conn.commit()
    rows_affected = c.rowcount
    conn.close()
    return rows_affected > 0

def delete_contact(contact_id):
    conn = get_db_connection()
    if not conn: return False
    c = conn.cursor()
    c.execute('DELETE FROM contact_submissions WHERE id = %s', (contact_id,))
    conn.commit()
    rows_affected = c.rowcount
    conn.close()
    return rows_affected > 0

def display_submission(s):
    print(f"\n[{s['timestamp'].strftime('%Y-%m-%d %H:%M')}] ID: {s['id']}")
    print(f"Name: {s['name']} | Email: {s['email']}")
    print(f"Subject: {s['subject']}")
    print(f"Message: {s['description']}")
    print("-" * 40)

def handle_unresolved():
    while True:
        submissions = fetch_contacts(resolved=False)
        print(f"\n=== Unresolved Contacts ({len(submissions)}) ===")
        for s in submissions:
            display_submission(s)

        if not submissions:
            input("Press Enter to return...")
            return

        choice = input("\nEnter ID to Mark as RESOLVED (or 'del ID' to delete, 'b' to back): ").strip()
        
        if choice.lower() == 'b':
            return
        elif choice.lower().startswith('del '):
            cid = choice.split(' ', 1)[1]
            if delete_contact(cid): print("Submission deleted.")
            else: print("Submission not found.")
        else:
            if resolve_contact(choice): print("Marked as resolved!")
            else: print("Submission not found.")

def handle_resolved():
    while True:
        submissions = fetch_contacts(resolved=True)
        print(f"\n=== Resolved Contacts ({len(submissions)}) ===")
        for s in submissions:
            display_submission(s)

        if not submissions:
            input("Press Enter to return...")
            return

        choice = input("\nEnter 'del ID' to permanently delete (or 'b' to back): ").strip()
        
        if choice.lower() == 'b':
            return
        elif choice.lower().startswith('del '):
            cid = choice.split(' ', 1)[1]
            if delete_contact(cid): print("Submission deleted permanently.")
            else: print("Submission not found.")
        else:
            print("Invalid command.")

def main():
    while True:
        print("\n=== Contact Form Manager ===")
        print("1. View Unresolved Submissions")
        print("2. View Resolved Submissions Archive")
        print("3. Exit")
        
        choice = input("Select: ").strip()
        
        if choice == '1':
            handle_unresolved()
        elif choice == '2':
            handle_resolved()
        elif choice == '3':
            break
        else:
            print("Invalid choice.")

if __name__ == "__main__":
    main()
