# DocAI - Comprehensive Deployment Guide

This guide details the exact step-by-step process for deploying the DocAI web application from your local computer to the live internet completely for free. 

Our deployment architecture uses three separate cloud services:
1. **GitHub**: Stores your code in the cloud.
2. **Render**: Hosts your Python backend API and your permanent PostgreSQL Database.
3. **Vercel**: Hosts your React frontend User Interface.

---

## Step 1: Push Your Code to GitHub (Local Preparation)
Before any cloud service can host your app, your code needs to be stored on GitHub.

1. Open a new Repository on GitHub (do not add a `.gitignore`, `README`, or License).
2. Open your terminal in your `Project` folder on your computer.
3. Run the following commands in order:
```bash
git init
git add .
git commit -m "Initial Deployment Commit"
git branch -M main
git remote add origin https://github.com/YourUsername/YourRepoName.git
git push -u origin main
```
*Note: Our custom `.gitignore` files automatically block sensitive data (like your `.env` API keys) and massive folders (like `node_modules` or `.venv`) from uploading.*

---

## Step 2: Create the Live Database (Render PostgreSQL)
We need a place to permanently store your user reviews and study guides. 

1. Create a free account at [Render.com](https://render.com/).
2. Click **New +** and select **PostgreSQL**.
3. Fill out the creation form:
   - **Name**: Choose any name (e.g., `docai-database`)
   - **Database / User / Datadog**: **Leave blank**. Render will securely generate these.
   - **Instance Type**: Ensure **Free** ($0/month) is selected.
4. Click **Create Database**.
5. Once your database is created, scroll down its page and find the **Internal Database URL** (it will look like `postgres://user:password@server...`).
6. **Copy this Internal Database URL.** You will need it in the next step.

*Why do this? Your Python backend requires a permanent database. If we tried to use local files like SQLite, Render would delete them every time its free servers went to sleep!*

---

## Step 3: Deploy the Backend API (Render Web Service)
Now we will launch the Python server that processes the PDFs using Google Gemini.

1. On the Render dashboard, click **New +** and select **Web Service**.
2. Select **"Build and deploy from a Git repository"** and connect your DocAI GitHub repository.
3. Fill out the service settings exactly as follows:
   - **Name**: `docai-backend` (or similar)
   - **Root Directory**: `backend` *(Critically Important: This tells Render to only look in the backend folder)*
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt` *(This installs FastAPI, pdfplumber, psycopg2, etc.)*
   - **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port 10000` *(Critically Important: `0.0.0.0` allows Render's internal network to route public traffic to your API)*
   - **Instance Type**: **Free**
4. Open the **Environment** tab on the left (or scroll down to Advanced -> Environment Variables).
5. Click **Add Environment Variable** twice to add the following two keys:
   - **Key 1**: `GEMINI_API_KEY` | **Value 1**: *(Your actual Google AI Studio API key)*
   - **Key 2**: `DATABASE_URL` | **Value 2**: *(Paste the `postgres://` Internal Database URL you copied in Step 2)*
6. Click **Deploy Web Service** at the bottom.

Render will spend a few minutes installing Python and downloading your libraries. Once it says "Live", copy your new backend URL (e.g., `https://docai-backend.onrender.com`).

---

## Step 4: Deploy the Frontend Interface (Vercel)
Finally, we deploy the React Website that your users will actually see and interact with.

1. Create a free account at [Vercel.com](https://vercel.com/) and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your `DocAI` GitHub repository.
4. In the "Configure Project" screen, change the following:
   - **Framework Preset**: Ensure `Vite` is selected.
   - **Root Directory**: Click "Edit" and select the `frontend` folder. *(Critically Important)*
   - **Build and Output Settings**: **Do not touch these.** Vercel automatically knows the correct Vite commands to run.
5. Expand the **Environment Variables** section.
   - **Name**: `VITE_API_URL`
   - **Value**: *(Paste your live Render Backend URL from Step 3, e.g., `https://docai-backend.onrender.com`. Ensure there is no trailing slash `/` at the end)*
   - Click **Add**.
6. Click the large **Deploy** button.

*Why do this? Because React code is not readable by browsers directly. Vercel automatically runs a build command to compile your React code into highly optimized HTML, CSS, and pure JavaScript. The `VITE_API_URL` variable instructs your frontend to send its API requests (like PDF uploads) to the live Render server rather than `http://127.0.0.1`.*

Once Vercel finishes building (usually under 30 seconds), it will provide you with your public `your-project.vercel.app` URL.

**Congratulations! Your DocAI application is successfully live on the internet!**
