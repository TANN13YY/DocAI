import sqlite3
import os

# Check if we are running on Render with a persistent disk attached
RENDER_DISK_PATH = "/opt/render/project/src/backend/data"
if os.path.exists(RENDER_DISK_PATH):
    print("Persistent Disk found! Using Render mount.")
    DB_NAME = os.path.join(RENDER_DISK_PATH, "app.db")
else:
    # We are running locally
    DB_NAME = "app.db"

def get_db_connection():
    if not os.path.exists(DB_NAME):
        print(f"Error: Database '{DB_NAME}' not found.")
        return None
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def list_reviews(is_approved):
    conn = get_db_connection()
    if not conn: return []
    
    c = conn.cursor()
    c.execute('SELECT * FROM reviews WHERE is_approved = ? ORDER BY created_at DESC', (1 if is_approved else 0,))
    reviews = c.fetchall()
    conn.close()
    return reviews

def approve_review(review_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('UPDATE reviews SET is_approved = 1 WHERE id = ?', (review_id,))
    conn.commit()
    rows_affected = c.rowcount
    conn.close()
    return rows_affected > 0

def unapprove_review(review_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('UPDATE reviews SET is_approved = 0 WHERE id = ?', (review_id,))
    conn.commit()
    rows_affected = c.rowcount
    conn.close()
    return rows_affected > 0

def delete_review(review_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('DELETE FROM reviews WHERE id = ?', (review_id,))
    conn.commit()
    rows_affected = c.rowcount
    conn.close()
    return rows_affected > 0

def handle_pending():
    while True:
        reviews = list_reviews(is_approved=False)
        print(f"\n--- Pending Reviews ({len(reviews)}) ---")
        for r in reviews:
            print(f"[ID: {r['id']}] {r['name']} ({r['rating']}/5): {r['content'][:60]}...")

        if not reviews:
            print("No pending reviews.")
            input("Press Enter to return...")
            return

        choice = input("\nEnter ID to APPROVE (or 'del ID' to delete, 'b' to back): ").strip()
        
        if choice.lower() == 'b':
            return
        elif choice.lower().startswith('del '):
            try:
                rid = int(choice.split()[1])
                if delete_review(rid): print(f"Review {rid} deleted.")
                else: print("Review not found.")
            except: print("Invalid format. Use 'del ID'")
        else:
            try:
                rid = int(choice)
                if approve_review(rid): print(f"Review {rid} approved!")
                else: print("Review not found.")
            except: print("Invalid ID.")

def handle_approved():
    while True:
        reviews = list_reviews(is_approved=True)
        print(f"\n--- Active/Approved Reviews ({len(reviews)}) ---")
        for r in reviews:
            print(f"[ID: {r['id']}] {r['name']} ({r['rating']}/5): {r['content'][:60]}...")

        if not reviews:
            print("No active reviews.")
            input("Press Enter to return...")
            return

        choice = input("\nEnter ID to UNAPPROVE (or 'del ID' to delete permanently, 'b' to back): ").strip()
        
        if choice.lower() == 'b':
            return
        elif choice.lower().startswith('del '):
            try:
                rid = int(choice.split()[1])
                confirm = input(f"Are you sure you want to PERMANENTLY DELETE review {rid}? (y/n): ")
                if confirm.lower() == 'y':
                    if delete_review(rid): print(f"Review {rid} permanently deleted.")
                    else: print("Review not found.")
            except: print("Invalid format. Use 'del ID'")
        else:
            try:
                rid = int(choice)
                if unapprove_review(rid): print(f"Review {rid} moved back to pending.")
                else: print("Review not found.")
            except: print("Invalid ID.")

def main():
    while True:
        print("\n=== Review Manager ===")
        print("1. Manage Pending Reviews (Approve/Reject)")
        print("2. Manage Active Reviews (Unapprove/Delete)")
        print("3. Exit")
        
        choice = input("Select: ").strip()
        
        if choice == '1':
            handle_pending()
        elif choice == '2':
            handle_approved()
        elif choice == '3':
            break
        else:
            print("Invalid option.")

if __name__ == "__main__":
    main()
