from fastapi import APIRouter, Depends, HTTPException, Body
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
from middleware.auth_middleware import get_current_user
from services.firebase_service import get_db
from models.schemas import SuccessResponse

router = APIRouter(prefix="/api/applied-jobs", tags=["applied-jobs"])


class SaveJobRequest(BaseModel):
    id: Optional[str] = None
    job_title: str
    company_name: str
    location: str
    remote_status: Optional[str] = "remote"
    compatibility_score: Optional[int] = 85
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    posted_ago: Optional[str] = "Recently"
    missing_skills: Optional[List[str]] = []
    platform: Optional[str] = "Indeed"
    platform_id: Optional[str] = "indeed"
    job_url: str
    status: Optional[str] = "Applied"  # Applied, Interviewing, Offer, Rejected, Saved
    notes: Optional[str] = ""


class UpdateJobStatusRequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


@router.get("", response_model=SuccessResponse)
async def get_applied_jobs(user=Depends(get_current_user)):
    db = get_db()
    uid = user["uid"]
    docs = (
        db.collection("applied_jobs")
        .where("uid", "==", uid)
        .stream()
    )
    results = []
    for doc in docs:
        d = doc.to_dict()
        results.append({**d, "id": doc.id})
    results.sort(key=lambda x: x.get("applied_at", ""), reverse=True)
    return SuccessResponse(data=results)


@router.post("", response_model=SuccessResponse)
async def save_applied_job(body: SaveJobRequest, user=Depends(get_current_user)):
    db = get_db()
    uid = user["uid"]

    # Check if already saved
    existing = list(
        db.collection("applied_jobs")
        .where("uid", "==", uid)
        .where("job_url", "==", body.job_url)
        .stream()
    )
    if existing:
        doc_id = existing[0].id
        db.collection("applied_jobs").document(doc_id).update({
            "status": body.status or "Applied",
            "notes": body.notes or existing[0].to_dict().get("notes", ""),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })
        return SuccessResponse(data={"id": doc_id, **body.dict()}, message="Job status updated")

    doc_ref = db.collection("applied_jobs").document()
    job_data = {
        **body.dict(),
        "uid": uid,
        "applied_at": datetime.now(timezone.utc).isoformat(),
    }
    doc_ref.set(job_data)
    return SuccessResponse(data={"id": doc_ref.id, **job_data}, message="Job saved to Applied Tracker")


@router.patch("/{job_id}", response_model=SuccessResponse)
async def update_applied_job(job_id: str, body: UpdateJobStatusRequest, user=Depends(get_current_user)):
    db = get_db()
    uid = user["uid"]
    doc_ref = db.collection("applied_jobs").document(job_id)
    doc = doc_ref.get()
    if not doc.exists or doc.to_dict().get("uid") != uid:
        raise HTTPException(status_code=404, detail="Job not found")

    update_payload = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if body.status:
        update_payload["status"] = body.status
    if body.notes is not None:
        update_payload["notes"] = body.notes

    doc_ref.update(update_payload)
    return SuccessResponse(data={"id": job_id, **doc.to_dict(), **update_payload})


@router.delete("/{job_id}", response_model=SuccessResponse)
async def delete_applied_job(job_id: str, user=Depends(get_current_user)):
    db = get_db()
    uid = user["uid"]
    doc_ref = db.collection("applied_jobs").document(job_id)
    doc = doc_ref.get()
    if not doc.exists or doc.to_dict().get("uid") != uid:
        raise HTTPException(status_code=404, detail="Job not found")

    doc_ref.delete()
    return SuccessResponse(message="Job removed from applied list")
