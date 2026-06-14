from fastapi import APIRouter, Depends, HTTPException
from middleware.auth_middleware import get_current_user
from services.firebase_service import get_db
from services.gemini_service import rewrite_bullet
from models.schemas import RewriteBulletRequest, ActionItemUpdateRequest, SuccessResponse

router = APIRouter(prefix="/api/optimizer", tags=["optimizer"])


@router.post("/rewrite-bullet", response_model=SuccessResponse)
async def rewrite_bullet_endpoint(body: RewriteBulletRequest, user=Depends(get_current_user)):
    optimized = await rewrite_bullet(body.bullet_text, body.job_title or "")
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
        .order_by("created_at", direction="DESCENDING")
        .limit(1)
        .stream()
    )
    if not docs:
        raise HTTPException(status_code=404, detail="No analysis found — run an analysis first")

    result = docs[0].to_dict().get("result", {})
    improvements = result.get("strategic_improvements", [])
    unreadable = result.get("unreadable_sections", [])

    # Check for existing progress
    progress_ref = db.collection("optimizer_progress").document(f"{uid}_{resume_id}")
    progress_doc = progress_ref.get()
    existing_items = {item["id"]: item for item in (progress_doc.to_dict() or {}).get("items", [])} if progress_doc.exists else {}

    items = []
    for i, imp in enumerate(improvements):
        item_id = f"item_{i}"
        is_unreadable = any(imp.get("title", "").lower() in section.lower() for section in unreadable)
        priority = "critical" if (is_unreadable or imp.get("points", 0) > 5) else "normal"
        existing = existing_items.get(item_id, {})
        items.append({
            "id": item_id,
            "title": imp.get("title"),
            "description": imp.get("description"),
            "points": imp.get("points", 0),
            "completed": existing.get("completed", False),
            "priority": priority,
        })

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
