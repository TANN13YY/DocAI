# DocAI - Smart PDF & DOCX Analyzer

A full-stack web application utilizing Google Gemini AI (2.5 Flash) to transform PDF and DOCX documents into structured study guides, quizzes, and translated notes.

## Features
- Intelligent Summarization: Extracts executive summaries, key concepts, and detailed notes from long documents (up to 50MB).
- Interactive AI Chatbot: Provides context-aware answers to queries based on the uploaded document.
- Knowledge Quizzes: Generates 10-question multiple-choice quizzes based on the document's contents.
- Listen & Translate: Features Text-to-Speech (TTS) capabilities and one-click translation into Hindi.
- Public Sharing: Generates read-only, shareable public links for study guides.
- Professional Export: Allows downloading of the formatted study guide as a standard PDF.
- Admin Review System: Includes an integrated user review system and contact form with backend CLI management tools (`manage_reviews.py` and `manage_contacts.py`).
- Dynamic Interface: Built with React and Tailwind CSS, featuring dark mode and responsive design.

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, Axios, Lucide-React
- Backend: Python, FastAPI, PostgreSQL, pdfplumber, python-docx
- AI Integration: Google Generative AI (gemini-2.5-flash)

## Prerequisites
- Python 3.8+
- Node.js 16+
- Google Gemini API Key (Get one free from Google AI Studio)
- Cloud PostgreSQL Database URL

## Installation & Local Setup

### 1. Backend Setup
Navigate to the backend directory and establish a Python virtual environment.
```bash
cd backend
python -m venv .venv

# Activate virtual environment (Windows): 
.venv\Scripts\activate
# Activate virtual environment (Mac/Linux): 
source .venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder and configure your API key and Postgres connection URL:
```env
GEMINI_API_KEY=your_actual_api_key_here
DATABASE_URL=postgres://your_database_url_here
```

### 2. Frontend Setup
Navigate to the frontend directory and install Node dependencies:
```bash
cd frontend
npm install
```

## Running the Application

The backend and frontend servers must run simultaneously in two separate terminal instances.

### Terminal 1: Start Backend API
```bash
cd backend
# Ensure your virtual environment is active
python -m uvicorn main:app --reload --port 8000
```
The backend API will initialize at http://127.0.0.1:8000

### Terminal 2: Start Frontend UI
```bash
cd frontend
npm run dev
```
The user interface will initialize at http://localhost:5173

## Preparing for Deployment

The application is structured to decouple the frontend and backend for modern cloud deployment.

### 1. Database Deployment (Render PostgreSQL)
The backend requires a persistent PostgreSQL database. Create a free PostgreSQL instance on Render.com and copy the provided Internal Database URL.

### 2. Backend Deployment (Render Web Service)
Deploy the `backend` directory as a new Web Service on Render. Set the root directory to `backend`, the environment to Python 3, and the start command to `python -m uvicorn main:app --host 0.0.0.0 --port 10000`. You must configure two Environment Variables in the Render dashboard:
- `GEMINI_API_KEY`: Your Google AI Studio key.
- `DATABASE_URL`: The Internal Database URL generated in step 1.

### 3. Frontend Deployment (Vercel)
Deploy the `frontend` directory as a new project on Vercel. Vercel will automatically detect the Vite framework and handle the build settings. You must configure one Environment Variable in the Vercel dashboard:
- `VITE_API_URL`: The public URL of your deployed Render backend service (e.g., `https://your-backend.onrender.com`). Ensure there is no trailing slash.

For a comprehensive, step-by-step walkthrough of this exact process, please read the included `DEPLOYMENT.md` file.