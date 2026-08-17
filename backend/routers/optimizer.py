import json
from fastapi import APIRouter, Depends, HTTPException, Request
from middleware.auth_middleware import get_current_user
from services.firebase_service import get_db
from services.ai_service import rewrite_bullet
from models.schemas import RewriteBulletRequest, ActionItemUpdateRequest, SuccessResponse

router = APIRouter(prefix="/api/optimizer", tags=["optimizer"])


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


@router.post("/rewrite-bullet", response_model=SuccessResponse)
async def rewrite_bullet_endpoint(request: Request, body: RewriteBulletRequest, user=Depends(get_current_user)):
    ai_config = extract_ai_config(request)
    optimized = await rewrite_bullet(body.bullet_text, body.job_title or "", ai_config=ai_config)
    return SuccessResponse(data={"rewritten": optimized})


@router.get("/action-items/{resume_id}", response_model=SuccessResponse)
async def get_action_items(resume_id: str, user=Depends(get_current_user)):
    db = get_db()
    uid = user["uid"]

    # Verify ownership
    resume_doc = db.collection("resumes").document(resume_id).get()
    if not resume_doc.exists or resume_doc.to_dict().get("uid") != uid:
        raise HTTPException(status_code=403, detail="Access denied")

    # Fetch latest analysis
    docs = list(
        db.collection("analyses")
        .where("resume_id", "==", resume_id)
        .stream()
    )
    if not docs:
        raise HTTPException(status_code=404, detail="No analysis found — run an analysis first")

    docs.sort(key=lambda x: x.to_dict().get("created_at", ""), reverse=True)

    result = docs[0].to_dict().get("result", {})
    improvements = result.get("strategic_improvements", [])
    unreadable = result.get("unreadable_sections", [])
    keywords_missing = result.get("keywords_missing", [])
    parsing_factors = result.get("parsing_factors", {})

    # Check for existing progress
    progress_ref = db.collection("optimizer_progress").document(f"{uid}_{resume_id}")
    progress_doc = progress_ref.get()
    existing_items = {item["id"]: item for item in (progress_doc.to_dict() or {}).get("items", [])} if progress_doc.exists else {}

    items = []
    item_counter = 0

    # 1. Parsing issues (critical)
    for factor, info in parsing_factors.items():
        status = info.get("status", "").lower() if isinstance(info, dict) else ""
        note = info.get("note", "") if isinstance(info, dict) else ""
        if status in ["failed", "warning"]:
            item_id = f"item_parse_{factor}"
            existing = existing_items.get(item_id, {})
            items.append({
                "id": item_id,
                "title": f"Fix {factor.replace('_', ' ').title()} Issue",
                "description": note or f"Your {factor.replace('_', ' ')} section needs formatting optimization.",
                "points": 10 if status == "failed" else 5,
                "completed": existing.get("completed", False),
                "priority": "critical" if status == "failed" else "normal",
                "category": "formatting",
            })

    # 2. Missing Keywords (high priority)
    if keywords_missing:
        item_id = "item_missing_keywords"
        existing = existing_items.get(item_id, {})
        top_missing = ", ".join(keywords_missing[:6])
        items.append({
            "id": item_id,
            "title": f"Add Critical Missing Keywords ({len(keywords_missing)} detected)",
            "description": f"Integrate these required keywords naturally into your skills and work experience: {top_missing}.",
            "points": 15,
            "completed": existing.get("completed", False),
            "priority": "critical",
            "category": "keywords",
        })

    # 3. Strategic Improvements
    for imp in improvements:
        item_id = f"item_imp_{item_counter}"
        item_counter += 1
        priority = "critical" if imp.get("points", 0) >= 10 else "normal"
        existing = existing_items.get(item_id, {})
        items.append({
            "id": item_id,
            "title": imp.get("title", "Optimize Resume Content"),
            "description": imp.get("description", "Improve bullet phrasing and quantified achievements."),
            "points": imp.get("points", 5),
            "completed": existing.get("completed", False),
            "priority": priority,
            "category": "content",
        })

    # Fallback if no items
    if not items:
        items = [
            {
                "id": "item_default_1",
                "title": "Quantify Work Experience Impact",
                "description": "Add metrics, percentages, or dollar amounts to your work bullet points.",
                "points": 10,
                "completed": False,
                "priority": "normal",
                "category": "content",
            },
            {
                "id": "item_default_2",
                "title": "Standardize Section Headings",
                "description": "Use conventional headings like 'Work Experience', 'Education', 'Skills'.",
                "points": 5,
                "completed": False,
                "priority": "normal",
                "category": "formatting",
            }
        ]

    # Save / update progress doc
    progress_ref.set({"uid": uid, "resume_id": resume_id, "items": items})
    return SuccessResponse(data=items)


@router.patch("/action-items/{resume_id}/{item_id}", response_model=SuccessResponse)
async def update_action_item(
    resume_id: str, item_id: str,
    body: ActionItemUpdateRequest,
    user=Depends(get_current_user),
):
    db = get_db()
    uid = user["uid"]
    progress_ref = db.collection("optimizer_progress").document(f"{uid}_{resume_id}")
    doc = progress_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="No progress found for this resume")

    data = doc.to_dict()
    items = data.get("items", [])
    updated_item = None
    for item in items:
        if item["id"] == item_id:
            item["completed"] = body.completed
            updated_item = item
            break

    if not updated_item:
        raise HTTPException(status_code=404, detail="Action item not found")

    progress_ref.update({"items": items})
    return SuccessResponse(data=updated_item)
