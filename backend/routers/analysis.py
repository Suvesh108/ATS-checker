from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from middleware.auth_middleware import get_current_user
from services.firebase_service import get_db
from services.gemini_service import analyze_resume
from models.schemas import AnalyzeRequest, SuccessResponse

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.post("/analyze", response_model=SuccessResponse)
async def run_analysis(body: AnalyzeRequest, user=Depends(get_current_user)):
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

    result = await analyze_resume(resume_data["extracted_text"], job_description)

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
        .order_by("created_at", direction="DESCENDING")
        .limit(1)
        .stream()
    )
    items = list(docs)
    if not items:
        raise HTTPException(status_code=404, detail="No analysis found for this resume")

    data = items[0].to_dict()
    data["analysis_id"] = items[0].id
    return SuccessResponse(data=data)
