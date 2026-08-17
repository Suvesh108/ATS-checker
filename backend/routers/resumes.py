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
    is_img = any(ext in ct for ext in ["image", "png", "jpeg", "jpg", "webp"]) or any(filename_lower.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp"])

    if not is_pdf and not is_docx and not is_img:
        raise HTTPException(status_code=415, detail="Accepted file types: PDF, DOCX, PNG, JPG, or WEBP resumes.")

    try:
        extracted_text = extract_text(file_bytes, ct, filename=file.filename or "")
    except ValueError as e:
        raise HTTPException(status_code=415, detail=str(e))

    # Upload to Firebase Storage
    storage_url = ""
    blob_name = ""
    try:
        bucket = get_bucket()
        if bucket:
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            blob_name = f"resumes/{uid}/{timestamp}_{file.filename}"
            blob = bucket.blob(blob_name)
            blob.upload_from_string(file_bytes, content_type=ct)
            blob.make_public()
            storage_url = blob.public_url
    except Exception as storage_err:
        import logging
        logging.getLogger("curator").warning(f"Firebase Storage upload failed: {storage_err}. Falling back to mock URL.")
        storage_url = f"https://example.com/mock-resumes/{file.filename}"
        blob_name = f"mock-resumes/{file.filename}"

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
    results.sort(key=lambda x: x.get("uploaded_at", ""), reverse=True)
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
