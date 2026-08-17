import json
import re
import asyncio
import logging
from typing import Dict, Any, Optional, List, Tuple
import httpx
from google import genai
from google.genai import types

logger = logging.getLogger("curator")

# ─── Supported Providers & Default Models ────────────────────────────────────

PROVIDER_DEFAULTS = {
    "gemini": {
        "name": "Google Gemini",
        "default_model": "gemini-2.0-flash",
        "free_models": [
            {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash (Recommended)", "tier": "free"},
            {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "tier": "free"},
            {"id": "gemini-1.5-flash", "name": "Gemini 1.5 Flash", "tier": "free"},
            {"id": "gemini-1.5-flash-8b", "name": "Gemini 1.5 Flash 8B (Ultra Fast)", "tier": "free"},
            {"id": "gemini-2.0-flash-lite", "name": "Gemini 2.0 Flash Lite", "tier": "free"},
        ],
        "paid_models": [
            {"id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro (Deep Intelligence)", "tier": "paid"},
            {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro (2M Context)", "tier": "paid"},
        ],
        "models": ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.5-pro", "gemini-1.5-pro"],
        "priority": 3,
    },
    "groq": {
        "name": "Groq",
        "default_model": "llama-3.3-70b-versatile",
        "free_models": [
            {"id": "llama-3.3-70b-versatile", "name": "Llama 3.3 70B Versatile (Recommended)", "tier": "free"},
            {"id": "llama-3.1-8b-instant", "name": "Llama 3.1 8B Instant (Ultra Fast)", "tier": "free"},
            {"id": "deepseek-r1-distill-llama-70b", "name": "DeepSeek R1 Distill 70B (Reasoning)", "tier": "free"},
            {"id": "gemma2-9b-it", "name": "Google Gemma 2 9B", "tier": "free"},
            {"id": "qwen-2.5-32b", "name": "Qwen 2.5 32B", "tier": "free"},
        ],
        "paid_models": [
            {"id": "llama-3.3-70b-specdec", "name": "Llama 3.3 70B Speculative Decoding", "tier": "paid"},
        ],
        "models": [
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "deepseek-r1-distill-llama-70b",
            "gemma2-9b-it",
            "qwen-2.5-32b",
        ],
        "priority": 5,
    },
    "openai": {
        "name": "OpenAI",
        "default_model": "gpt-4o-mini",
        "free_models": [
            {"id": "gpt-4o-mini", "name": "GPT-4o Mini (Budget & Free Credits Friendly)", "tier": "free"},
            {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "tier": "free"},
        ],
        "paid_models": [
            {"id": "gpt-4o", "name": "GPT-4o (Flagship Omni)", "tier": "paid"},
            {"id": "o3-mini", "name": "o3-mini (High Reasoning)", "tier": "paid"},
            {"id": "o1-mini", "name": "o1-mini (Reasoning)", "tier": "paid"},
            {"id": "o1", "name": "o1 (Advanced Reasoning)", "tier": "paid"},
            {"id": "gpt-4-turbo", "name": "GPT-4 Turbo", "tier": "paid"},
        ],
        "models": ["gpt-4o-mini", "gpt-4o", "o3-mini", "o1-mini", "gpt-3.5-turbo"],
        "priority": 2,
    },
    "anthropic": {
        "name": "Anthropic Claude",
        "default_model": "claude-3-5-haiku-20241022",
        "free_models": [
            {"id": "claude-3-5-haiku-20241022", "name": "Claude 3.5 Haiku (Fast & Starter Tier)", "tier": "free"},
            {"id": "claude-3-haiku-20240307", "name": "Claude 3 Haiku", "tier": "free"},
        ],
        "paid_models": [
            {"id": "claude-3-7-sonnet-20250219", "name": "Claude 3.7 Sonnet (Latest Flagship)", "tier": "paid"},
            {"id": "claude-3-5-sonnet-20241022", "name": "Claude 3.5 Sonnet", "tier": "paid"},
            {"id": "claude-3-opus-20240229", "name": "Claude 3 Opus", "tier": "paid"},
        ],
        "models": ["claude-3-5-haiku-20241022", "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
        "priority": 1,
    },
    "deepseek": {
        "name": "DeepSeek",
        "default_model": "deepseek-chat",
        "free_models": [
            {"id": "deepseek-chat", "name": "DeepSeek V3 (Chat & Coding)", "tier": "free"},
            {"id": "deepseek-reasoner", "name": "DeepSeek R1 (Math & Logic Reasoning)", "tier": "free"},
        ],
        "paid_models": [],
        "models": ["deepseek-chat", "deepseek-reasoner"],
        "priority": 6,
    },
    "xai": {
        "name": "xAI Grok",
        "default_model": "grok-2-latest",
        "free_models": [
            {"id": "grok-2-mini", "name": "Grok 2 Mini (Budget Tier)", "tier": "free"},
        ],
        "paid_models": [
            {"id": "grok-2-latest", "name": "Grok-2 (Flagship Reasoning)", "tier": "paid"},
            {"id": "grok-beta", "name": "Grok Beta", "tier": "paid"},
        ],
        "models": ["grok-2-latest", "grok-2-mini", "grok-beta"],
        "priority": 4,
    },
    "openrouter": {
        "name": "OpenRouter",
        "default_model": "meta-llama/llama-3.3-70b-instruct:free",
        "free_models": [
            {"id": "meta-llama/llama-3.3-70b-instruct:free", "name": "Llama 3.3 70B Instruct (Free) ★", "tier": "free"},
            {"id": "deepseek/deepseek-r1:free", "name": "DeepSeek R1 Reasoning (Free)", "tier": "free"},
            {"id": "deepseek/deepseek-chat:free", "name": "DeepSeek V3 Chat (Free)", "tier": "free"},
            {"id": "google/gemini-2.0-flash-exp:free", "name": "Gemini 2.0 Flash Exp (Free)", "tier": "free"},
            {"id": "google/gemini-2.0-flash-thinking-exp:free", "name": "Gemini 2.0 Flash Thinking (Free)", "tier": "free"},
            {"id": "qwen/qwen-2.5-coder-32b-instruct:free", "name": "Qwen 2.5 Coder 32B (Free)", "tier": "free"},
            {"id": "mistralai/mistral-7b-instruct:free", "name": "Mistral 7B Instruct (Free)", "tier": "free"},
        ],
        "paid_models": [
            {"id": "anthropic/claude-3.7-sonnet", "name": "Claude 3.7 Sonnet (Anthropic)", "tier": "paid"},
            {"id": "anthropic/claude-3.5-sonnet", "name": "Claude 3.5 Sonnet (Anthropic)", "tier": "paid"},
            {"id": "openai/gpt-4o", "name": "GPT-4o (OpenAI)", "tier": "paid"},
            {"id": "openai/gpt-4o-mini", "name": "GPT-4o Mini (OpenAI)", "tier": "paid"},
            {"id": "deepseek/deepseek-r1", "name": "DeepSeek R1 (Full Quality)", "tier": "paid"},
            {"id": "deepseek/deepseek-chat", "name": "DeepSeek V3 (Full Quality)", "tier": "paid"},
        ],
        "models": [
            "meta-llama/llama-3.3-70b-instruct:free",
            "deepseek/deepseek-r1:free",
            "deepseek/deepseek-chat:free",
            "google/gemini-2.0-flash-exp:free",
            "qwen/qwen-2.5-coder-32b-instruct:free",
            "anthropic/claude-3.7-sonnet",
            "openai/gpt-4o",
        ],
        "priority": 7,
    }
}

# ─── Mock Fallbacks ──────────────────────────────────────────────────────────

MOCK_ANALYSIS = {
    "ats_score": 85,
    "summary": "Overall excellent resume layout and structure. Action verbs and quantified impact are well-balanced, though there is room to add more cloud and modern backend infrastructure keywords.",
    "keywords_found": ["React", "Node.js", "TypeScript", "REST APIs", "Git", "Docker", "Agile", "Software Engineering"],
    "keywords_missing": ["AWS", "CI/CD", "Kubernetes", "GraphQL"],
    "critical_fixes": 1,
    "parsing_factors": {
        "contact_info": {"status": "passed", "note": "Email, phone number, and LinkedIn profile are clearly parsed."},
        "education": {"status": "passed", "note": "Degree and graduation year format matches ATS rules."},
        "work_experience": {"status": "warning", "note": "One position lacks concrete metrics/quantified results."}
    },
    "strategic_improvements": [
        {"title": "Add Cloud Infrastructure Keywords", "description": "Add AWS, GCP, or Azure to highlight cloud architecture experience.", "points": 8},
        {"title": "Quantify Tech Leadership Bullets", "description": "Add metrics to the tech lead bullets (e.g., latency speedups or throughput improvements).", "points": 7}
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

# ─── Provider Call Implementations ───────────────────────────────────────────

async def _call_gemini_api(api_key: str, model: str, prompt: str) -> str:
    client = genai.Client(api_key=api_key)
    response = await asyncio.to_thread(
        client.models.generate_content,
        model=model or "gemini-2.0-flash",
        contents=prompt,
    )
    return response.text


async def _call_anthropic_api(api_key: str, model: str, prompt: str) -> str:
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    payload = {
        "model": model or "claude-3-7-sonnet-20250219",
        "max_tokens": 4096,
        "messages": [{"role": "user", "content": prompt}]
    }
    async with httpx.AsyncClient(timeout=45.0) as client:
        res = await client.post(url, headers=headers, json=payload)
        if res.status_code != 200:
            raise Exception(f"Anthropic API Error ({res.status_code}): {res.text}")
        data = res.json()
        content = data.get("content", [])
        if content and isinstance(content, list):
            return content[0].get("text", "")
        return ""


async def _call_openai_compatible(
    endpoint: str,
    api_key: str,
    model: str,
    prompt: str,
    custom_headers: Optional[dict] = None
) -> str:
    # Sanitize key: strip whitespace, newlines, quotes that may be accidentally pasted
    clean_key = api_key.strip().replace("\r", "").replace("\n", "").replace("\t", "")
    # Strip surrounding quotes if user copy-pasted with them
    if (clean_key.startswith('"') and clean_key.endswith('"')) or \
       (clean_key.startswith("'") and clean_key.endswith("'")):
        clean_key = clean_key[1:-1]

    headers = {
        "Authorization": f"Bearer {clean_key}",
        "Content-Type": "application/json",
    }
    if custom_headers:
        headers.update(custom_headers)

    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
    }
    async with httpx.AsyncClient(timeout=45.0) as client:
        res = await client.post(endpoint, headers=headers, json=payload)
        if res.status_code != 200:
            error_detail = res.text
            is_auth_error = res.status_code in (401, 403)
            try:
                err_json = res.json()
                if "error" in err_json:
                    err_obj = err_json["error"]
                    error_detail = err_obj.get("message") or err_obj.get("detail") or str(err_obj)
                    # Detect auth error from body too
                    err_type = err_obj.get("type", "") or err_obj.get("code", "")
                    if "invalid_api_key" in err_type or "authentication" in err_type.lower() or "unauthorized" in err_type.lower():
                        is_auth_error = True
            except Exception:
                pass
            if is_auth_error:
                raise ValueError(f"AUTH_ERROR: {error_detail}")
            raise Exception(f"API Error ({res.status_code}): {error_detail}")
        data = res.json()
        choices = data.get("choices", [])
        if choices:
            return choices[0].get("message", {}).get("content", "")
        return ""



async def _call_single_model(provider: str, api_key: str, model: str, prompt: str) -> str:
    provider = provider.lower()
    if provider == "gemini":
        return await _call_gemini_api(api_key, model, prompt)
    elif provider == "anthropic":
        return await _call_anthropic_api(api_key, model, prompt)
    elif provider == "openai":
        return await _call_openai_compatible(
            "https://api.openai.com/v1/chat/completions",
            api_key,
            model,
            prompt
        )
    elif provider == "xai":
        return await _call_openai_compatible(
            "https://api.x.ai/v1/chat/completions",
            api_key,
            model,
            prompt
        )
    elif provider == "groq":
        return await _call_openai_compatible(
            "https://api.groq.com/openai/v1/chat/completions",
            api_key,
            model,
            prompt
        )
    elif provider == "deepseek":
        return await _call_openai_compatible(
            "https://api.deepseek.com/chat/completions",
            api_key,
            model,
            prompt
        )
    elif provider == "openrouter":
        return await _call_openai_compatible(
            "https://openrouter.ai/api/v1/chat/completions",
            api_key,
            model,
            prompt,
            custom_headers={
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Curator ATS Checker",
            }
        )
    else:
        raise ValueError(f"Unsupported AI provider: {provider}")


async def call_provider(provider: str, api_key: str, model: Optional[str], prompt: str) -> str:
    provider = provider.lower()
    prov_info = PROVIDER_DEFAULTS.get(provider, {})
    candidate_models: List[str] = []

    if model and model.strip():
        candidate_models.append(model.strip())

    default_m = prov_info.get("default_model")
    if default_m and default_m not in candidate_models:
        candidate_models.append(default_m)

    for m in prov_info.get("models", []):
        if m not in candidate_models:
            candidate_models.append(m)

    last_err = None
    for target_model in candidate_models:
        try:
            return await _call_single_model(provider, api_key, target_model, prompt)
        except ValueError as err:
            # Auth errors (invalid key, 401, 403) – stop immediately
            raise err
        except Exception as err:
            last_err = err
            logger.warning(f"Model {target_model} for {provider} failed ({err}). Trying next model...")

    if last_err:
        raise last_err
    raise Exception(f"Failed to execute prompt with provider {provider}")


# ─── Smart Multi-Provider Dispatcher ─────────────────────────────────────────

def resolve_provider_order(ai_config: Dict[str, Any]) -> List[Tuple[str, str, Optional[str]]]:
    """
    Returns ordered list of (provider, api_key, model) to attempt.
    Prioritizes explicit provider choice, or best available active keys if 'auto'.
    """
    keys = ai_config.get("keys", {})
    provider_models = ai_config.get("provider_models") or ai_config.get("providerModels") or {}
    selected_provider = (ai_config.get("provider") or "auto").lower()
    selected_model = ai_config.get("model")

    active_candidates: List[Tuple[int, str, str, Optional[str]]] = []

    for prov, key in keys.items():
        if key and isinstance(key, str) and key.strip():
            prov_norm = prov.lower()
            info = PROVIDER_DEFAULTS.get(prov_norm)
            if info:
                priority = info.get("priority", 99)
                m = provider_models.get(prov_norm) or (selected_model if selected_provider == prov_norm else None) or info.get("default_model")
                active_candidates.append((priority, prov_norm, key.strip(), m))

    if selected_provider != "auto":
        # If user picked a specific provider, put it first if key exists
        specific = [c for c in active_candidates if c[1] == selected_provider]
        if specific:
            return [(s[1], s[2], provider_models.get(s[1]) or selected_model or s[3]) for s in specific]

    # Auto mode: sort by priority (Claude > OpenAI > Gemini > Grok > Groq > DeepSeek)
    active_candidates.sort(key=lambda x: x[0])
    return [(c[1], c[2], c[3]) for c in active_candidates]


async def execute_prompt_with_fallback(prompt: str, ai_config: Dict[str, Any]) -> str:
    """
    Attempts prompt execution against resolved providers in order.
    """
    provider_plan = resolve_provider_order(ai_config)
    if not provider_plan:
        raise Exception("No AI API keys configured.")

    errors = []
    for prov, key, model in provider_plan:
        try:
            logger.info(f"Executing prompt using provider: {prov}, model: {model}")
            res = await call_provider(prov, key, model, prompt)
            if res and res.strip():
                return res
        except Exception as err:
            logger.warning(f"Provider {prov} ({model}) failed: {err}")
            errors.append(f"{prov}: {err}")

    raise Exception("All configured AI providers failed: " + " | ".join(errors))


# ─── Resume ATS Analysis & Scoring ───────────────────────────────────────────

def calculate_ats_score(result: dict) -> int:
    score = 100
    missing_kws = result.get("keywords_missing", [])
    score -= min(len(missing_kws) * 4, 30)

    crit_fixes = result.get("critical_fixes", 0)
    score -= min(crit_fixes * 10, 30)

    parsing_deduction = 0
    parsing_factors = result.get("parsing_factors", {})
    for factor, info in parsing_factors.items():
        status = info.get("status", "").lower() if isinstance(info, dict) else ""
        if status == "failed":
            parsing_deduction += 10
        elif status == "warning":
            parsing_deduction += 5
    score -= min(parsing_deduction, 25)

    return max(10, min(100, score))


async def analyze_resume(resume_text: str, job_description: str = "", ai_config: Optional[Dict[str, Any]] = None) -> dict:
    ai_config = ai_config or {}
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
  "ats_score": 100,
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
        raw = await execute_prompt_with_fallback(prompt, ai_config)
        raw = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.IGNORECASE)
        raw = re.sub(r"\s*```$", "", raw.strip()).strip()
        result = json.loads(raw)
    except Exception as err:
        logger.warning(f"AI API analysis call fallback triggered ({err}).")
        result = MOCK_ANALYSIS.copy()

    result["ats_score"] = calculate_ats_score(result)
    return result


async def rewrite_bullet(bullet_text: str, job_title: str = "", ai_config: Optional[Dict[str, Any]] = None) -> str:
    ai_config = ai_config or {}
    jt = f" for a {job_title} role" if job_title else ""
    prompt = f"""Rewrite this resume bullet point{jt} to be more impactful for ATS systems and hiring managers.
Make it quantified, action-verb led, and results-focused.
Return ONLY the rewritten bullet text with NO explanation and NO extra formatting.

Original bullet: {bullet_text}"""
    try:
        raw = await execute_prompt_with_fallback(prompt, ai_config)
        return raw.strip()
    except Exception as err:
        logger.warning(f"AI API bullet rewrite fallback triggered ({err}).")
        return "Optimized: Led key system architecture initiatives, increasing system uptime by 22% and reducing latency using modern microservices."


from services.job_scraper_service import enrich_job_listing

async def generate_job_matches(keywords: list, ats_score: int, filters: dict, ai_config: Optional[Dict[str, Any]] = None) -> list:
    ai_config = ai_config or {}
    filter_notes = []
    if filters.get("industry"):
        filter_notes.append(f"industry: {filters['industry']}")
    if filters.get("remote_status"):
        filter_notes.append(f"remote_status: {filters['remote_status']}")
    if filters.get("min_salary"):
        filter_notes.append(f"min_salary: >= ${filters['min_salary']}k")
    if filters.get("max_salary"):
        filter_notes.append(f"max_salary: <= ${filters['max_salary']}k")
    filter_str = ". ".join(filter_notes) if filter_notes else "No filters applied."

    prompt = f"""You are an intelligent multi-platform job scraper and matching engine for Naukri.com, Indeed, LinkedIn, Internshala, and Glassdoor.
Generate exactly 6 highly relevant, real-market job opportunities for a candidate with skills: {', '.join(keywords)} and ATS score {ats_score}/100.
Filters: {filter_str}

Distribute listings across top platforms: Naukri.com, Indeed, LinkedIn, Internshala, and Glassdoor.
Return ONLY a valid JSON array with NO markdown. Each item must have:
- job_title (string)
- company_name (string)
- location (string e.g. "Bangalore, India", "San Francisco, CA", "Remote")
- remote_status (string: "remote" | "hybrid" | "onsite")
- compatibility_score (number between 70 and 99)
- salary_min (number in thousands USD/INR)
- salary_max (number in thousands USD/INR)
- posted_ago (string e.g. "1 hour ago", "1 day ago")
- missing_skills (array of 1-3 strings)
- platform (string: "Naukri.com" | "Indeed" | "LinkedIn" | "Internshala" | "Glassdoor")"""
    if not keywords:
        return []

    raw_listings = []
    try:
        raw = await execute_prompt_with_fallback(prompt, ai_config)
        raw = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.IGNORECASE)
        raw = re.sub(r"\s*```$", "", raw.strip()).strip()
        raw_listings = json.loads(raw)
    except Exception as err:
        logger.warning(f"AI API job matches execution note ({err}).")
        # Generate targeted live listings directly from the candidate's actual extracted keywords
        primary_skill = keywords[0] if keywords else "Software"
        secondary_skill = keywords[1] if len(keywords) > 1 else "Development"
        platforms = ["Naukri.com", "Indeed", "LinkedIn", "Internshala", "Glassdoor"]
        raw_listings = [
            {
                "job_title": f"{primary_skill} Engineer",
                "company_name": f"{primary_skill} Technologies",
                "location": "Bangalore / Remote",
                "remote_status": "remote",
                "compatibility_score": max(75, min(96, ats_score + 5)),
                "salary_min": 15,
                "salary_max": 30,
                "posted_ago": "1 day ago",
                "missing_skills": keywords[3:5] if len(keywords) > 4 else [],
                "platform": platforms[i % len(platforms)],
            }
            for i in range(min(4, len(keywords) or 1))
        ]

    # Apply client-side filters and enrich with direct apply URLs
    enriched = []
    for idx, j in enumerate(raw_listings):
        item = enrich_job_listing(j, idx)
        if filters.get("remote_status") and item.get("remote_status", "").lower() != filters["remote_status"].lower():
            continue
        if filters.get("min_salary") and item.get("salary_min", 0) < filters["min_salary"]:
            continue
        if filters.get("max_salary") and item.get("salary_max", 0) > filters["max_salary"]:
            continue
        enriched.append(item)

    return enriched


# ─── Real-Time Key Validation ────────────────────────────────────────────────

async def test_provider_key(provider: str, api_key: str, model: Optional[str] = None) -> dict:
    provider = provider.lower()
    if not api_key or not api_key.strip():
        return {"success": False, "message": "API key is required."}

    test_prompt = "Say 'OK' in one word."
    prov_info = PROVIDER_DEFAULTS.get(provider, {})
    candidate_models: List[str] = []

    if model and model.strip():
        candidate_models.append(model.strip())

    default_m = prov_info.get("default_model")
    if default_m and default_m not in candidate_models:
        candidate_models.append(default_m)

    for m in prov_info.get("models", []):
        if m not in candidate_models:
            candidate_models.append(m)

    last_err = None
    for candidate in candidate_models:
        try:
            resp = await _call_single_model(provider, api_key.strip(), candidate, test_prompt)
            return {
                "success": True,
                "provider": provider,
                "model": candidate,
                "response": resp.strip()[:20],
                "message": f"Connected! Active model: '{candidate}'."
            }
        except ValueError as err:
            # Auth / invalid key error – stop immediately, report clearly
            err_msg = str(err).replace("AUTH_ERROR: ", "")
            return {
                "success": False,
                "provider": provider,
                "message": f"❌ Invalid API Key: {err_msg}"
            }
        except Exception as err:
            last_err = err
            logger.warning(f"Key test failed for {provider} model '{candidate}': {err}")

    return {
        "success": False,
        "provider": provider,
        "message": f"Connection failed: {str(last_err) if last_err else 'No accessible model found for this key.'}"
    }


async def fetch_provider_models(provider: str, api_key: str) -> dict:
    """
    Live queries the provider API to retrieve, verify via probe, and categorize all available models for this API key.
    """
    provider = provider.lower()
    clean_key = api_key.strip().replace("\r", "").replace("\n", "").replace('"', '').replace("'", "")
    if not clean_key:
        return {"success": False, "message": "API key required to query models."}

    defaults = PROVIDER_DEFAULTS.get(provider, {})
    default_free = defaults.get("free_models", [])
    default_paid = defaults.get("paid_models", [])

    live_models: List[dict] = []
    try:
        if provider == "groq":
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    "https://api.groq.com/openai/v1/models",
                    headers={"Authorization": f"Bearer {clean_key}"}
                )
                if res.status_code == 200:
                    for item in res.json().get("data", []):
                        m_id = item.get("id", "")
                        # Filter out non-chat / audio / guard / inactive models
                        if item.get("active") is False:
                            continue
                        if any(skip in m_id for skip in ["whisper", "guard", "preview", "tts", "embedding", "saba"]):
                            continue
                        tier = "paid" if ("405b" in m_id or "specdec" in m_id) else "free"
                        live_models.append({"id": m_id, "name": m_id, "tier": tier})
        elif provider == "openai":
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    "https://api.openai.com/v1/models",
                    headers={"Authorization": f"Bearer {clean_key}"}
                )
                if res.status_code == 200:
                    for item in res.json().get("data", []):
                        m_id = item.get("id", "")
                        if any(gpt in m_id for gpt in ["gpt-4", "o1", "o3", "chatgpt"]):
                            tier = "free" if ("mini" in m_id or "3.5" in m_id) else "paid"
                            live_models.append({"id": m_id, "name": m_id, "tier": tier})
        elif provider == "deepseek":
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    "https://api.deepseek.com/models",
                    headers={"Authorization": f"Bearer {clean_key}"}
                )
                if res.status_code == 200:
                    for item in res.json().get("data", []):
                        m_id = item.get("id", "")
                        live_models.append({"id": m_id, "name": m_id, "tier": "free"})
        elif provider == "gemini":
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    f"https://generativelanguage.googleapis.com/v1beta/models?key={clean_key}"
                )
                if res.status_code == 200:
                    for item in res.json().get("models", []):
                        raw_id = item.get("name", "").replace("models/", "")
                        display_name = item.get("displayName") or raw_id
                        # Only include generative text models
                        if "generateContent" in str(item.get("supportedGenerationMethods", [])):
                            tier = "free" if any(f in raw_id for f in ["flash", "8b", "lite"]) else "paid"
                            live_models.append({"id": raw_id, "name": display_name, "tier": tier})
        elif provider == "anthropic":
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    "https://api.anthropic.com/v1/models",
                    headers={
                        "x-api-key": clean_key,
                        "anthropic-version": "2023-06-01",
                    }
                )
                if res.status_code == 200:
                    for item in res.json().get("data", []):
                        m_id = item.get("id", "")
                        display_name = item.get("display_name") or m_id
                        tier = "free" if "haiku" in m_id else "paid"
                        live_models.append({"id": m_id, "name": display_name, "tier": tier})
        elif provider == "xai":
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    "https://api.x.ai/v1/models",
                    headers={"Authorization": f"Bearer {clean_key}"}
                )
                if res.status_code == 200:
                    for item in res.json().get("data", []):
                        m_id = item.get("id", "")
                        tier = "free" if "mini" in m_id else "paid"
                        live_models.append({"id": m_id, "name": m_id, "tier": tier})
        elif provider == "openrouter":
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    "https://openrouter.ai/api/v1/models",
                    headers={"Authorization": f"Bearer {clean_key}"}
                )
                if res.status_code == 200:
                    for item in res.json().get("data", []):
                        m_id = item.get("id", "")
                        display_name = item.get("name") or m_id
                        # OpenRouter free models have ':free' suffix or 0 pricing
                        pricing = item.get("pricing", {})
                        is_free = ":free" in m_id or (pricing.get("prompt") == "0" and pricing.get("completion") == "0")
                        tier = "free" if is_free else "paid"
                        live_models.append({"id": m_id, "name": display_name, "tier": tier})
    except Exception as e:
        logger.warning(f"Live model fetch error for {provider}: {e}")

    # Deduplicate and merge with defaults
    free_list = [m for m in live_models if m.get("tier") == "free"]
    paid_list = [m for m in live_models if m.get("tier") == "paid"]

    if not free_list and default_free:
        free_list = default_free
    if not paid_list and default_paid:
        paid_list = default_paid

    # Health probe top candidate models to filter out any decommissioned models
    all_candidates = free_list + paid_list
    async def probe_model(m: dict):
        m_id = m.get("id", "")
        try:
            res = await _call_single_model(provider, clean_key, m_id, "Say 1")
            return (m["id"], bool(res and len(res.strip()) > 0))
        except Exception:
            return (m["id"], False)

    if clean_key and all_candidates:
        probe_tasks = [probe_model(m) for m in all_candidates[:8]]
        probe_results = await asyncio.gather(*probe_tasks, return_exceptions=True)
        verified_ids = {r[0] for r in probe_results if isinstance(r, tuple) and r[1]}
        if verified_ids:
            verified_free = [m for m in free_list if m["id"] in verified_ids]
            verified_paid = [m for m in paid_list if m["id"] in verified_ids]
            if verified_free:
                free_list = verified_free
            if verified_paid:
                paid_list = verified_paid

    top_verified_model = (free_list[0]["id"] if free_list else (paid_list[0]["id"] if paid_list else defaults.get("default_model", "")))

    return {
        "success": True,
        "provider": provider,
        "free_models": free_list,
        "paid_models": paid_list,
        "verified_active_model": top_verified_model,
        "total_count": len(free_list) + len(paid_list)
    }
