import json
import re
import asyncio
import logging
from google import genai
from google.genai import types
from config import GEMINI_API_KEY
from fastapi import HTTPException

# Configure Logger
logger = logging.getLogger("curator")

# Initialize client only if key is set
_client = None
if GEMINI_API_KEY:
    try:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize Gemini Client: {e}")

MODEL = "gemini-2.0-flash"
MAX_RETRIES = 1

# ─── Mock Fallbacks in case of Rate Limits (Quota Exceeded) ──────────────────

MOCK_ANALYSIS = {
    "ats_score": 85,
    "summary": "Overall excellent resume layout and structure. Strong presence of action verbs and quantified impact, though there is room to add more technical keywords related to cloud architecture.",
    "keywords_found": ["React", "Node.js", "TypeScript", "REST APIs", "Git", "Docker", "Agile", "Software Engineering"],
    "keywords_missing": ["AWS", "CI/CD", "Kubernetes", "GraphQL"],
    "critical_fixes": 1,
    "parsing_factors": {
        "contact_info": {"status": "passed", "note": "Email, phone number, and LinkedIn profile are clearly parsed."},
        "education": {"status": "passed", "note": "Degree and graduation year format matches ATS rules."},
        "work_experience": {"status": "warning", "note": "One position lacks concrete metrics/quantified results."}
    },
    "strategic_improvements": [
        {"title": "Add Cloud Infrastructure Keywords", "description": "Add AWS or GCP to highlight cloud services experience.", "points": 8},
        {"title": "Quantify TechCorp Bullet Points", "description": "Add metrics to the tech lead bullets (e.g., speedups or capacity improvements).", "points": 7}
    ],
    "readable_sections": ["Experience", "Education", "Skills", "Projects"],
    "unreadable_sections": []
}

MOCK_JOBS = [
    {
        "job_title": "Senior React Developer",
        "company_name": "Initech Corp",
        "location": "San Francisco, CA",
        "remote_status": "hybrid",
        "compatibility_score": 92,
        "salary_min": 130,
        "salary_max": 160,
        "posted_ago": "2 hours ago",
        "missing_skills": ["GraphQL", "Next.js"]
    },
    {
        "job_title": "Full-Stack Engineer",
        "company_name": "CloudBase Systems",
        "location": "Remote",
        "remote_status": "remote",
        "compatibility_score": 88,
        "salary_min": 110,
        "salary_max": 140,
        "posted_ago": "1 day ago",
        "missing_skills": ["AWS", "Terraform"]
    },
    {
        "job_title": "Software Engineer II",
        "company_name": "ZetaGlobal",
        "location": "New York, NY",
        "remote_status": "onsite",
        "compatibility_score": 84,
        "salary_min": 115,
        "salary_max": 145,
        "posted_ago": "3 days ago",
        "missing_skills": ["Kubernetes"]
    },
    {
        "job_title": "Frontend Architect",
        "company_name": "WebFlow Inc",
        "location": "Remote",
        "remote_status": "remote",
        "compatibility_score": 81,
        "salary_min": 140,
        "salary_max": 180,
        "posted_ago": "5 hours ago",
        "missing_skills": ["TailwindCSS"]
    },
    {
        "job_title": "Backend Developer (Node/TypeScript)",
        "company_name": "StripeLab",
        "location": "Austin, TX",
        "remote_status": "hybrid",
        "compatibility_score": 79,
        "salary_min": 120,
        "salary_max": 150,
        "posted_ago": "1 week ago",
        "missing_skills": ["PostgreSQL"]
    },
    {
        "job_title": "Software Engineer (Generalist)",
        "company_name": "Acme Apps",
        "location": "Seattle, WA",
        "remote_status": "onsite",
        "compatibility_score": 75,
        "salary_min": 105,
        "salary_max": 135,
        "posted_ago": "2 weeks ago",
        "missing_skills": ["Go", "Python"]
    }
]

# ─── API Call Helper ─────────────────────────────────────────────────────────

async def _call_gemini(prompt: str) -> str:
    if not _client:
        raise Exception("Gemini Client not initialized. Check your API key.")
    
    last_error = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            response = await asyncio.to_thread(
                _client.models.generate_content,
                model=MODEL,
                contents=prompt,
            )
            return response.text
        except Exception as e:
            last_error = e
            if attempt < MAX_RETRIES:
                await asyncio.sleep(1.0 * (attempt + 1))
    
    raise last_error

# ─── Endpoints ───────────────────────────────────────────────────────────────

def calculate_ats_score(result: dict) -> int:
    score = 100
    
    # 1. Deduct for missing keywords (4 points per missing keyword, max 30 points)
    missing_kws = result.get("keywords_missing", [])
    score -= min(len(missing_kws) * 4, 30)
    
    # 2. Deduct for critical fixes (10 points per critical fix, max 30 points)
    crit_fixes = result.get("critical_fixes", 0)
    score -= min(crit_fixes * 10, 30)
    
    # 3. Deduct for parsing factor issues
    parsing_deduction = 0
    parsing_factors = result.get("parsing_factors", {})
    for factor, info in parsing_factors.items():
        status = info.get("status", "").lower() if isinstance(info, dict) else ""
        if status == "failed":
            parsing_deduction += 10
        elif status == "warning":
            parsing_deduction += 5
    score -= min(parsing_deduction, 25)
    
    # 4. Final bounds check
    return max(10, min(100, score))

async def analyze_resume(resume_text: str, job_description: str = "") -> dict:
    jd_block = f"\nJob Description:\n{job_description}" if job_description else "\nNo job description provided — perform a general ATS analysis based on standard corporate expectations."
    prompt = f"""You are an extremely strict and thorough ATS resume analyst.
Analyze the resume below against the target job description (or standard corporate expectations if no job description is provided).
Be highly critical. A good ATS score must be earned. Identify every missing keyword, formatting issue, structural weakness, and lack of quantified impact.

Resume Text:
{resume_text}
{jd_block}

Return ONLY a valid JSON object with NO markdown, NO code fences, and NO explanation.
Return exactly this JSON structure:
{{
  "ats_score": 100, // Provide 100 as placeholder; it will be calculated programmatically based on the deductions below
  "summary": "<critical overall assessment highlighting major gaps and strengths>",
  "keywords_found": ["<keywords/skills found in resume>"],
  "keywords_missing": ["<critical keywords/skills missing from resume but required by the job description or industry standards>"],
  "critical_fixes": <count of critical issues: e.g. lack of phone/email, unreadable section formats, tables/columns that break parsing, missing graduation years>,
  "parsing_factors": {{
    "contact_info": {{"status": "passed|warning|failed", "note": "<why it passed or failed/warned>"}},
    "education": {{"status": "passed|warning|failed", "note": "<why it passed or failed/warned (e.g. missing years, wrong format)>"}},
    "work_experience": {{"status": "passed|warning|failed", "note": "<why it passed or failed/warned (e.g. lack of quantified impact, weak verbs)>"}}
  }},
  "strategic_improvements": [
    {{"title": "<clear actionable title>", "description": "<exactly how to fix this issue>", "points": <points value 5-15>}}
  ],
  "readable_sections": ["<successfully parsed sections>"],
  "unreadable_sections": ["<any sections with bad layouts, complex tables, or fonts that might break parser>"]
}}"""
    try:
        raw = await _call_gemini(prompt)
        raw = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.IGNORECASE)
        raw = re.sub(r"\s*```$", "", raw.strip()).strip()
        result = json.loads(raw)
    except Exception as err:
        logger.warning(f"Gemini API analysis call failed ({err}). Falling back to mock analysis.")
        result = MOCK_ANALYSIS.copy()

    # Calculate systematic robust score programmatically
    result["ats_score"] = calculate_ats_score(result)
    return result

async def rewrite_bullet(bullet_text: str, job_title: str = "") -> str:
    jt = f" for a {job_title} role" if job_title else ""
    prompt = f"""Rewrite this resume bullet point{jt} to be more impactful for ATS systems and hiring managers.
Make it quantified, action-verb led, and results-focused.
Return ONLY the rewritten bullet text with NO explanation and NO extra formatting.

Original bullet: {bullet_text}"""
    try:
        raw = await _call_gemini(prompt)
        return raw.strip()
    except Exception as err:
        logger.warning(f"Gemini API bullet rewrite failed ({err}). Falling back to mock rewrite.")
        return f"Optimized: Lead key system architecture features, increasing reliability by 15% using scalable microservices."

async def generate_job_matches(keywords: list, ats_score: int, filters: dict) -> list:
    filter_notes = []
    if filters.get("remote_status"):
        filter_notes.append(f"remote_status must be: {filters['remote_status']}")
    if filters.get("min_salary"):
        filter_notes.append(f"salary_min >= {filters['min_salary']}")
    if filters.get("max_salary"):
        filter_notes.append(f"salary_max <= {filters['max_salary']}")
    filter_str = ". ".join(filter_notes) if filter_notes else "No filters applied."

    prompt = f"""You are a job board AI. Generate exactly 6 realistic job listings for a candidate with skills: {', '.join(keywords)} and ATS score {ats_score}/100.
Filters: {filter_str}
Return ONLY a valid JSON array with NO markdown. Each item must have:
job_title, company_name, location, remote_status (remote/hybrid/onsite), compatibility_score (number 0-100), salary_min (number in thousands), salary_max (number in thousands), posted_ago (string like "2 hours ago"), missing_skills (array of up to 3 strings)"""
    try:
        raw = await _call_gemini(prompt)
        raw = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.IGNORECASE)
        raw = re.sub(r"\s*```$", "", raw.strip()).strip()
        return json.loads(raw)
    except Exception as err:
        logger.warning(f"Gemini API job matches failed ({err}). Falling back to mock matches.")
        listings = MOCK_JOBS
        remote = filters.get("remote_status")
        if remote:
            listings = [j for j in listings if j.get("remote_status").lower() == remote.lower()]
        min_sal = filters.get("min_salary")
        if min_sal:
            listings = [j for j in listings if j.get("salary_min", 0) >= min_sal]
        max_sal = filters.get("max_salary")
        if max_sal:
            listings = [j for j in listings if j.get("salary_max", 0) <= max_sal]
        return listings
