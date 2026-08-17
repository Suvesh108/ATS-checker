import json
from fastapi import APIRouter, Depends, Query, Request
from datetime import datetime, timezone, timedelta
from middleware.auth_middleware import get_current_user
from services.firebase_service import get_db
from services.ai_service import generate_job_matches
from models.schemas import SuccessResponse

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

CACHE_TTL_HOURS = 6


def extract_ai_config(request: Request) -> dict:
    ai_keys_hdr = request.headers.get("x-ai-keys")
    keys = {}
    if ai_keys_hdr:
        try:
            keys = json.loads(ai_keys_hdr)
        except Exception:
            pass
    for p in ["gemini", "anthropic", "openai", "xai", "groq", "deepseek"]:
        k = request.headers.get(f"x-ai-{p}-key")
        if k:
            keys[p] = k
    return {
        "provider": request.headers.get("x-ai-provider", "auto"),
        "model": request.headers.get("x-ai-model"),
        "keys": keys,
    }


@router.get("/matches", response_model=SuccessResponse)
async def get_job_matches(
    request: Request,
    industry: str = Query(None),
    min_salary: int = Query(None),
    max_salary: int = Query(None),
    remote_status: str = Query(None),
    user=Depends(get_current_user),
):
    db = get_db()
    uid = user["uid"]

    # Get latest analysis
    analyses = list(
        db.collection("analyses")
        .where("uid", "==", uid)
        .stream()
    )

    if not analyses:
        return SuccessResponse(data=[], message="No resume analyzed yet. Upload and analyze a resume to find job matches.")

    analyses.sort(key=lambda x: x.to_dict().get("created_at", ""), reverse=True)
    result = analyses[0].to_dict().get("result", {})
    keywords = result.get("keywords_found", [])
    current_score = result.get("ats_score", 0)

    if not keywords and current_score == 0:
        return SuccessResponse(data=[], message="No keywords extracted yet.")

    filters = {
        "industry": industry,
        "min_salary": min_salary,
        "max_salary": max_salary,
        "remote_status": remote_status,
    }

    # Check cache
    cache_ref = db.collection("job_matches").document(uid)
    cache_doc = cache_ref.get()
    now = datetime.now(timezone.utc)

    if cache_doc.exists:
        cached = cache_doc.to_dict()
        generated_at = datetime.fromisoformat(cached.get("generated_at", "1970-01-01T00:00:00+00:00"))
        age_ok = (now - generated_at) < timedelta(hours=CACHE_TTL_HOURS)
        score_unchanged = cached.get("latest_ats_score") == current_score
        if age_ok and score_unchanged:
            listings = cached.get("listings", [])
            # Apply filters client-side from cache
            if remote_status:
                listings = [j for j in listings if j.get("remote_status") == remote_status]
            if min_salary:
                listings = [j for j in listings if j.get("salary_min", 0) >= min_salary]
            if max_salary:
                listings = [j for j in listings if j.get("salary_max", 0) <= max_salary]
            return SuccessResponse(data=listings)

    # Generate fresh from AI Service
    ai_config = extract_ai_config(request)
    listings = await generate_job_matches(keywords, current_score, filters, ai_config=ai_config)

    # Save to cache
    cache_ref.set({
        "uid": uid,
        "listings": listings,
        "latest_ats_score": current_score,
        "generated_at": now.isoformat(),
    })

    return SuccessResponse(data=listings)
