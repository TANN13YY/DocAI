# Helper Scripts

## manage_reviews.py

This script allows you to manage user reviews directly in your PostgreSQL cloud database. 

**Prerequisites:**
You must have your `DATABASE_URL` properly configured inside your `backend/.env` file. The script uses this URL to connect to the live database.

**Usage:**
1. Open your terminal in the `backend/` directory.
2. Ensure your virtual environment is active.
3. Run `python manage_reviews.py`.

**Features:**
- **Manage Pending Reviews**: View reviews waiting for approval.
  - Enter an ID to **Approve**.
  - Type `del <ID>` to **Delete/Reject**.
- **Manage Active Reviews**: View reviews currently visible on the website.
  - Enter an ID to **Unapprove** (moves it back to pending).
  - Type `del <ID>` to **Delete permanently**.
