import psycopg2
import psycopg2.extras
import json
import uuid
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# We depend on the DATABASE_URL environment variable provided by Render/Neon
DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    if not DATABASE_URL:
        print("Warning: DATABASE_URL not set. Database connection failed.")
        return None
        
    conn = psycopg2.connect(DATABASE_URL)
    # Return dictionary-like cursor similar to sqlite3.Row
    conn.cursor_factory = psycopg2.extras.DictCursor
    return conn

def init_db():
    conn = get_db_connection()
    if not conn: return
    c = conn.cursor()
    
    # Create reviews table
    c.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            role VARCHAR(255),
            content TEXT NOT NULL,
            rating INTEGER NOT NULL,
            is_approved BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create shared_summaries table
    c.execute('''
        CREATE TABLE IF NOT EXISTS shared_summaries (
            id VARCHAR(255) PRIMARY KEY,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    
    # Auto-migrate for existing databases
    migrate_reviews_table()
    init_contact_table()
    print("Database initialized.")

def migrate_reviews_table():
    """Adds is_approved column if it doesn't exist."""
    conn = get_db_connection()
    if not conn: return
    c = conn.cursor()
    try:
        # Check if column exists in postgres
        c.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='reviews' and column_name='is_approved';
        """)
        if not c.fetchone():
            print("Migrating reviews table: adding is_approved column...")
            c.execute("ALTER TABLE reviews ADD COLUMN is_approved BOOLEAN DEFAULT FALSE")
            conn.commit()
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        conn.close()

def add_review(name, role, content, rating):
    conn = get_db_connection()
    if not conn: return None
    c = conn.cursor()
    
    c.execute('INSERT INTO reviews (name, role, content, rating, is_approved) VALUES (%s, %s, %s, %s, FALSE) RETURNING id',
              (name, role, content, rating))
    conn.commit()
    review_id = c.fetchone()[0]
    conn.close()
    return review_id

def get_reviews():
    conn = get_db_connection()
    if not conn: return []
    c = conn.cursor()
    # Only fetch approved reviews
    c.execute('SELECT * FROM reviews WHERE is_approved = TRUE ORDER BY created_at DESC')
    reviews = c.fetchall()
    conn.close()
    return [dict(row) for row in reviews]

def save_summary(content):
    conn = get_db_connection()
    if not conn: return None
    c = conn.cursor()
    share_id = str(uuid.uuid4())
    c.execute('INSERT INTO shared_summaries (id, content) VALUES (%s, %s)',
              (share_id, content))
    conn.commit()
    conn.close()
    return share_id

def get_summary(share_id):
    conn = get_db_connection()
    if not conn: return None
    c = conn.cursor()
    c.execute('SELECT content FROM shared_summaries WHERE id = %s', (share_id,))
    row = c.fetchone()
    conn.close()
    return row['content'] if row else None

def init_contact_table():
    conn = get_db_connection()
    if not conn: return
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS contact_submissions (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            subject VARCHAR(255),
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
    if not conn: return
    c = conn.cursor()
    try:
        c.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='contact_submissions' and column_name='issue_resolved';
        """)
        if not c.fetchone():
            print("Migrating contact_submissions table: adding issue_resolved column...")
            c.execute("ALTER TABLE contact_submissions ADD COLUMN issue_resolved INTEGER DEFAULT 0")
            conn.commit()
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        conn.close()

def add_contact_submission(id, name, email, subject, description, timestamp, issue_resolved=0):
    conn = get_db_connection()
    if not conn: return
    c = conn.cursor()
    c.execute('INSERT INTO contact_submissions (id, name, email, subject, description, timestamp, issue_resolved) VALUES (%s, %s, %s, %s, %s, %s, %s)',
              (id, name, email, subject, description, timestamp, issue_resolved))
    conn.commit()
    conn.close()
