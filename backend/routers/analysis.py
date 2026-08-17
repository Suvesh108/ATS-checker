import json
from fastapi import APIRouter, Depends, HTTPException, Request
from datetime import datetime, timezone
from middleware.auth_middleware import get_current_user
from services.firebase_service import get_db
from services.ai_service import analyze_resume
from models.schemas import AnalyzeRequest, SuccessResponse

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


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


@router.post("/analyze", response_model=SuccessResponse)
async def run_analysis(request: Request, body: AnalyzeRequest, user=Depends(get_current_user)):
    db = get_db()
    uid = user["uid"]

    resume_doc = db.collection("resumes").document(body.resume_id).get()
    if not resume_doc.exists:
        raise HTTPException(status_code=404, detail="Resume not found")
    resume_data = resume_doc.to_dict()
    if resume_data.get("uid") != uid:
        raise HTTPException(status_code=403, detail="Access denied")

    job_description = body.job_description or resume_data.get("job_description", "")
    if body.job_description:
        db.collection("resumes").document(body.resume_id).update({"job_description": job_description})

    ai_config = extract_ai_config(request)
    result = await analyze_resume(resume_data["extracted_text"], job_description, ai_config=ai_config)

    # Save analysis to Firestore
    analysis_ref = db.collection("analyses").document()
    analysis_ref.set({
        "resume_id": body.resume_id,
        "uid": uid,
        "result": result,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    # Update resume document
    db.collection("resumes").document(body.resume_id).update({
        "latest_score": result.get("ats_score"),
        "status": "analyzed",
    })

    return SuccessResponse(data={"analysis_id": analysis_ref.id, "result": result})


@router.get("/{resume_id}", response_model=SuccessResponse)
async def get_analysis(resume_id: str, user=Depends(get_current_user)):
    db = get_db()

    resume_doc = db.collection("resumes").document(resume_id).get()
    if not resume_doc.exists:
        raise HTTPException(status_code=404, detail="Resume not found")
    if resume_doc.to_dict().get("uid") != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    docs = (
        db.collection("analyses")
        .where("resume_id", "==", resume_id)
        .stream()
    )
    items = list(docs)
    if not items:
        raise HTTPException(status_code=404, detail="No analysis found for this resume")

    items.sort(key=lambda x: x.to_dict().get("created_at", ""), reverse=True)
    data = items[0].to_dict()
    data["analysis_id"] = items[0].id
    return SuccessResponse(data=data)
