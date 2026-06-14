from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from datetime import datetime, timezone
from middleware.auth_middleware import get_current_user
from services.firebase_service import get_db, get_bucket, create_firebase_user
from models.schemas import SignupRequest, ProfileUpdateRequest, SuccessResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=SuccessResponse)
async def signup(body: SignupRequest):
    try:
        uid = create_firebase_user(body.email, body.password)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    db = get_db()
    db.collection("users").document(uid).set({
        "uid": uid,
        "first_name": body.first_name,
        "last_name": body.last_name,
        "email": body.email,
        "plan": "free",
        "avatar_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return SuccessResponse(data={"uid": uid}, message="Account created successfully")


@router.get("/me", response_model=SuccessResponse)
async def get_me(user=Depends(get_current_user)):
    db = get_db()
    uid = user["uid"]
    doc_ref = db.collection("users").document(uid)
    doc = doc_ref.get()

    if not doc.exists:
        # 🛠️ Self-healing: Create a default profile if it's missing
        # (Usually happens if signup was interrupted)
        email = user.get("email", "User")
        first_name = email.split("@")[0].capitalize()
        doc_ref.set({
            "uid": uid,
            "first_name": first_name,
            "last_name": "",
            "email": email,
            "plan": "free",
            "avatar_url": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        doc = doc_ref.get()

    resumes = db.collection("resumes").where("uid", "==", uid).stream()
    resume_list = list(resumes)
    scores = []
    for r in resume_list:
        rd = r.to_dict()
        score = rd.get("latest_score")
        if score is not None:
            scores.append(score)
    avg_score = round(sum(scores) / len(scores)) if scores else None

    profile = doc.to_dict()
    profile["stats"] = {
        "resumes_count": len(resume_list),
        "avg_score": avg_score,
        "job_matches_count": 0,
    }
    return SuccessResponse(data=profile)


@router.patch("/profile", response_model=SuccessResponse)
async def update_profile(
    first_name: str = Form(None),
    last_name: str = Form(None),
    photo: UploadFile = File(None),
    user=Depends(get_current_user),
):
    db = get_db()
    uid = user["uid"]
    updates = {}
    if first_name:
        updates["first_name"] = first_name
    if last_name:
        updates["last_name"] = last_name

    if photo:
        bucket = get_bucket()
        file_bytes = await photo.read()
        blob = bucket.blob(f"users/{uid}/avatar")
        blob.upload_from_string(file_bytes, content_type=photo.content_type)
        blob.make_public()
        updates["avatar_url"] = blob.public_url

    if updates:
        db.collection("users").document(uid).update(updates)

    updated = db.collection("users").document(uid).get().to_dict()
    return SuccessResponse(data=updated, message="Profile updated")
