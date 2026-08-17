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

## 🌐 Deployment (Vercel & Netlify)

### Deploy to Vercel (Frontend + Serverless Python API)
This project is configured out-of-the-box for Vercel with [`vercel.json`](file:///c:/Users/Suvesh/Desktop/projects/ATS%20Checker/vercel.json) and [`api/index.py`](file:///c:/Users/Suvesh/Desktop/projects/ATS%20Checker/api/index.py).
1. Connect your repository to [Vercel](https://vercel.com).
2. Framework Preset: **Vite** (Root Directory: `./`).
3. Vercel automatically detects the frontend and serverless Python API routes (`/api/*`).
4. (Optional) Set environment variables like `VITE_API_URL` if hosting backend separately.

### Deploy to Netlify
Configured with [`netlify.toml`](file:///c:/Users/Suvesh/Desktop/projects/ATS%20Checker/netlify.toml) and [`public/_redirects`](file:///c:/Users/Suvesh/Desktop/projects/ATS%20Checker/public/_redirects):
1. Connect your repository to [Netlify](https://www.netlify.com).
2. Build Command: `npm run build`
3. Publish Directory: `dist`
4. Set `VITE_API_URL` in Netlify Environment Variables pointing to your backend URL (or Vercel / Render backend).

---

## 🔗 Live Application
View and test your application:
👉 [GitHub Repository](https://github.com/)

