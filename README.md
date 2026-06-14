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

### Frontend Setup
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

## 🔗 Live Application
View and deploy your app in AI Studio:
👉 [AI Studio Dashboard](https://ai.studio/apps/cd6aa535-ada4-4114-aaa3-b63d3f9ea3f0)
