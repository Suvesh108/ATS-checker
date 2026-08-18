<div align="center">
  <img src="./public/logo.png" width="120" alt="Checkpoint ATS Logo" />
  <h1 align="center">Checkpoint ATS</h1>
  <p align="center">
    An AI-powered resume analysis and optimization platform to bypass ATS filters and land more interviews.
  </p>
</div>

<hr />

## 🚀 Overview

Checkpoint ATS (Curator) analyzes your resume, identifies missing keywords, formatting errors, and provides editorial-grade feedback using Gemini to optimize your bullets for maximum impact.

## 🛠️ Run Locally

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### Quick Start (Both Frontend & Backend)
Run both the Vite frontend (port 3000) and the FastAPI backend (port 8000) with a single command:
```bash
npm run dev:all
```

### Frontend Only
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your environment variables by adding your `GEMINI_API_KEY` in `.env.local`.
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```

## 🌐 Production Deployment (Vercel Frontend + Render Backend)

### Step 1: Deploy Backend to Render (Free Web Service)
1. Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** → **Web Service** (or **Blueprint** using `render.yaml`).
2. Connect your GitHub repository: `Suvesh108/ATS-checker`.
3. Configure the settings:
   - **Root Directory**: `backend` (or leave empty if using root `render.yaml`)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. In **Environment Variables**, add:
   - `FRONTEND_ORIGIN`: `https://*.vercel.app` (or your Vercel frontend URL)
5. Click **Create Web Service**. Copy your live backend URL (e.g. `https://curator-ats-backend.onrender.com`).

---

### Step 2: Deploy Frontend to Vercel (Fast Vite CDN)
1. Go to [vercel.com/new](https://vercel.com/new) and import your repository: `Suvesh108/ATS-checker`.
2. **Framework Preset**: Select **Vite** (Root Directory: `./`).
3. In **Environment Variables**, add:
   - **`VITE_API_URL`**: Your Render backend URL (e.g., `https://curator-ats-backend.onrender.com/api` or `https://curator-ats-backend.onrender.com`).
4. Click **Deploy**.

---

## 🔗 Repository
👉 [GitHub Repository](https://github.com/Suvesh108/ATS-checker)

