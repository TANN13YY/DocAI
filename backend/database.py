import sqlite3
import json
import uuid
from datetime import datetime

DB_NAME = "app.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Create reviews table
    c.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            role TEXT,
            content TEXT NOT NULL,
            rating INTEGER NOT NULL,
            is_approved BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create shared_summaries table
    c.execute('''
        CREATE TABLE IF NOT EXISTS shared_summaries (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    
    # Auto-migrate for existing databases
    migrate_reviews_table()
    print("Database initialized.")

def migrate_reviews_table():
    """Adds is_approved column if it doesn't exist."""
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute("SELECT is_approved FROM reviews LIMIT 1")
    except sqlite3.OperationalError:
        print("Migrating reviews table: adding is_approved column...")
        try:
            c.execute("ALTER TABLE reviews ADD COLUMN is_approved BOOLEAN DEFAULT 0")
            conn.commit()
        except Exception as e:
            print(f"Migration failed: {e}")
    conn.close()

def add_review(name, role, content, rating):
    conn = get_db_connection()
    c = conn.cursor()
    # Default is_approved to 0 (False)
    c.execute('INSERT INTO reviews (name, role, content, rating, is_approved) VALUES (?, ?, ?, ?, 0)',
              (name, role, content, rating))
    conn.commit()
    review_id = c.lastrowid
    conn.close()
    return review_id

def get_reviews():
    conn = get_db_connection()
    c = conn.cursor()
    # Only fetch approved reviews
    c.execute('SELECT * FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC')
    reviews = c.fetchall()
    conn.close()
    return [dict(row) for row in reviews]

def save_summary(content):
    conn = get_db_connection()
    c = conn.cursor()
    share_id = str(uuid.uuid4())
    c.execute('INSERT INTO shared_summaries (id, content) VALUES (?, ?)',
              (share_id, content))
    conn.commit()
    conn.close()
    return share_id

def get_summary(share_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT content FROM shared_summaries WHERE id = ?', (share_id,))
    row = c.fetchone()
    conn.close()
    return row['content'] if row else None

def init_contact_table():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS contact_submissions (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            description TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            issue_resolved INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()
    
    # Run migration if needed
    migrate_contact_table()

def migrate_contact_table():
    """Adds issue_resolved column if it doesn't exist."""
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute("SELECT issue_resolved FROM contact_submissions LIMIT 1")
    except sqlite3.OperationalError:
        print("Migrating contact_submissions table: adding issue_resolved column...")
        try:
            c.execute("ALTER TABLE contact_submissions ADD COLUMN issue_resolved INTEGER DEFAULT 0")
            conn.commit()
        except Exception as e:
            print(f"Migration failed: {e}")
    conn.close()

def add_contact_submission(id, name, email, subject, description, timestamp, issue_resolved=0):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO contact_submissions (id, name, email, subject, description, timestamp, issue_resolved) VALUES (?, ?, ?, ?, ?, ?, ?)',
              (id, name, email, subject, description, timestamp, issue_resolved))
    conn.commit()
    conn.close()
