from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from datetime import datetime, timezone
from middleware.auth_middleware import get_current_user
from services.firebase_service import get_db, get_bucket
from services.file_parser_service import extract_text
from models.schemas import SuccessResponse

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/upload", response_model=SuccessResponse)
async def upload_resume(
    file: UploadFile = File(...),
    job_description: str = Form(None),
    user=Depends(get_current_user),
):
    uid = user["uid"]
    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 5 MB limit")

    ct = file.content_type or ""
    filename_lower = (file.filename or "").lower()
    is_pdf = "pdf" in ct or filename_lower.endswith(".pdf")
    is_docx = "docx" in ct or "word" in ct or "openxmlformats" in ct or filename_lower.endswith(".docx")
    if not is_pdf and not is_docx:
        raise HTTPException(status_code=415, detail="Only PDF and DOCX files are accepted")
    # Normalise content type for parser
    if is_pdf:
        ct = "application/pdf"
    else:
        ct = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    try:
        extracted_text = extract_text(file_bytes, ct)
    except ValueError as e:
        raise HTTPException(status_code=415, detail=str(e))

    # Upload to Firebase Storage
    bucket = get_bucket()
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    blob_name = f"resumes/{uid}/{timestamp}_{file.filename}"
    blob = bucket.blob(blob_name)
    blob.upload_from_string(file_bytes, content_type=ct)
    # Use make_public — signed URLs require ADC/service-account key file on disk.
    # Files are scoped per-user (uid in path) and the URL is only stored in Firestore.
    blob.make_public()
    storage_url = blob.public_url

    db = get_db()
    doc_ref = db.collection("resumes").document()
    doc_ref.set({
        "uid": uid,
        "filename": file.filename,
        "storage_url": storage_url,
        "blob_name": blob_name,
        "extracted_text": extracted_text,
        "job_description": job_description or "",
        "latest_score": None,
        "status": "pending",
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    })

    # Save selected resume for frontend
    return SuccessResponse(
        data={"resume_id": doc_ref.id, "extracted_text": extracted_text},
        message="Resume uploaded successfully"
    )


@router.get("/", response_model=SuccessResponse)
async def list_resumes(user=Depends(get_current_user)):
    db = get_db()
    docs = (
        db.collection("resumes")
        .where("uid", "==", user["uid"])
        .order_by("uploaded_at", direction="DESCENDING")
        .stream()
    )
    results = []
    for doc in docs:
        d = doc.to_dict()
        results.append({
            "id": doc.id,
            "filename": d.get("filename"),
            "uploaded_at": d.get("uploaded_at"),
            "latest_score": d.get("latest_score"),
            "status": d.get("status"),
        })
    return SuccessResponse(data=results)


@router.get("/{resume_id}", response_model=SuccessResponse)
async def get_resume(resume_id: str, user=Depends(get_current_user)):
    db = get_db()
    doc = db.collection("resumes").document(resume_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Resume not found")
    data = doc.to_dict()
    if data.get("uid") != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return SuccessResponse(data={**data, "id": doc.id})


@router.delete("/{resume_id}", response_model=SuccessResponse)
async def delete_resume(resume_id: str, user=Depends(get_current_user)):
    db = get_db()
    doc = db.collection("resumes").document(resume_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Resume not found")
    data = doc.to_dict()
    if data.get("uid") != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied")

    # Delete from Storage
    try:
        bucket = get_bucket()
        blob_name = data.get("blob_name", "")
        if blob_name:
            blob = bucket.blob(blob_name)
            blob.delete()
    except Exception:
        pass  # Don't fail if storage delete fails

    db.collection("resumes").document(resume_id).delete()
    return SuccessResponse(message="Resume deleted successfully")
