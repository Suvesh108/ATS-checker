import json
import re
import asyncio
from google import genai
from google.genai import types
from config import GEMINI_API_KEY
from fastapi import HTTPException

_client = genai.Client(api_key=GEMINI_API_KEY)
MODEL = "gemini-2.0-flash"
MAX_RETRIES = 2


async def _call_gemini(prompt: str) -> str:
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
                await asyncio.sleep(1.5 * (attempt + 1))
    raise HTTPException(status_code=503, detail=f"Gemini API unavailable: {last_error}")


async def analyze_resume(resume_text: str, job_description: str = "") -> dict:
    jd_block = f"\nJob Description:\n{job_description}" if job_description else "\nNo job description provided — perform a general ATS analysis."
    prompt = f"""You are an expert ATS resume analyst.
Analyze the resume below and return ONLY a valid JSON object with NO markdown, NO code fences, and NO explanation.

Resume Text:
{resume_text}
{jd_block}

Return exactly this JSON structure:
{{
  "ats_score": <number 0-100>,
  "summary": "<overall assessment string>",
  "keywords_found": ["<keyword>"],
  "keywords_missing": ["<keyword>"],
  "critical_fixes": <number>,
  "parsing_factors": {{
    "contact_info": {{"status": "passed|warning|failed", "note": "<string>"}},
    "education": {{"status": "passed|warning|failed", "note": "<string>"}},
    "work_experience": {{"status": "passed|warning|failed", "note": "<string>"}}
  }},
  "strategic_improvements": [
    {{"title": "<string>", "description": "<string>", "points": <number>}}
  ],
  "readable_sections": ["<section name>"],
  "unreadable_sections": ["<section name>"]
}}"""
    raw = await _call_gemini(prompt)
    # Strip any markdown code fences Gemini might wrap the JSON in
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.IGNORECASE)
    raw = re.sub(r"\s*```$", "", raw.strip())
    raw = raw.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse Gemini response: {e}")


async def rewrite_bullet(bullet_text: str, job_title: str = "") -> str:
    jt = f" for a {job_title} role" if job_title else ""
    prompt = f"""Rewrite this resume bullet point{jt} to be more impactful for ATS systems and hiring managers.
Make it quantified, action-verb led, and results-focused.
Return ONLY the rewritten bullet text with NO explanation and NO extra formatting.

Original bullet: {bullet_text}"""
    return (await _call_gemini(prompt)).strip()


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
    raw = await _call_gemini(prompt)
    raw = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.IGNORECASE)
    raw = re.sub(r"\s*```$", "", raw.strip()).strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse Gemini job matches: {e}")
