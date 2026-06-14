from pydantic import BaseModel
from typing import Any, Optional, List


# ── Generic Response ──────────────────────────────────────────────────────────
class SuccessResponse(BaseModel):
    success: bool = True
    data: Any = None
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: str


# ── Auth ──────────────────────────────────────────────────────────────────────
class SignupRequest(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str


class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None


# ── Analysis ──────────────────────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    resume_id: str
    job_description: Optional[str] = None


# ── Optimizer ────────────────────────────────────────────────────────────────
class RewriteBulletRequest(BaseModel):
    bullet_text: str
    job_title: Optional[str] = None


class ActionItemUpdateRequest(BaseModel):
    completed: bool


# ── Jobs Filters ──────────────────────────────────────────────────────────────
class JobFilters(BaseModel):
    industry: Optional[str] = None
    min_salary: Optional[int] = None
    max_salary: Optional[int] = None
    remote_status: Optional[str] = None
