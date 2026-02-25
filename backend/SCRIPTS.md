# Helper Scripts

## manage_reviews.py

This script allows you to manage user reviews in the SQLite database.

**Usage:**
1. Open terminal in `backend/` directory.
2. Run `python manage_reviews.py`.

**Features:**
- **Manage Pending Reviews**: View reviews waiting for approval.
  - Enter an ID to **Approve**.
  - Type `del <ID>` to **Delete/Reject**.
- **Manage Active Reviews**: View reviews currently visible on the website.
  - Enter an ID to **Unapprove** (moves it back to pending).
  - Type `del <ID>` to **Delete permanently**.
