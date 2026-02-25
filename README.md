# DocAI - Smart PDF & DOCX Analyzer

A full-stack web application utilizing Google Gemini AI (2.5 Flash) to transform PDF and DOCX documents into structured study guides, quizzes, and translated notes.

## Features
- Intelligent Summarization: Extracts executive summaries, key concepts, and detailed notes from long documents (up to 50MB).
- Interactive AI Chatbot: Provides context-aware answers to queries based on the uploaded document.
- Knowledge Quizzes: Generates 10-question multiple-choice quizzes based on the document's contents.
- Listen & Translate: Features Text-to-Speech (TTS) capabilities and one-click translation into Hindi.
- Public Sharing: Generates read-only, shareable public links for study guides.
- Professional Export: Allows downloading of the formatted study guide as a standard PDF.
- Admin Review System: Includes an integrated user review system with a backend CLI management tool (manage_reviews.py).
- Dynamic Interface: Built with React and Tailwind CSS, featuring dark mode and responsive design.

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, Axios, Lucide-React
- Backend: Python, FastAPI, SQLite, pdfplumber, python-docx
- AI Integration: Google Generative AI (gemini-2.5-flash)

## Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- Google Gemini API Key

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

Create a `.env` file in the `backend/` folder and configure your API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
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
If deploying to platforms like Vercel (Frontend) or Render (Backend):
1. Frontend: Add your live backend URL to your Vercel Environment Variables as `VITE_API_URL`. The application will automatically route traffic appropriately.
2. Backend: Configure the `GEMINI_API_KEY` within your server's environment configuration. Ensure a persistent disk volume is attached if utilizing the local SQLite database (`app.db`) to prevent data loss between server restarts.
