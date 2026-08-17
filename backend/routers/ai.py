from fastapi import APIRouter, HTTPException, Body
from typing import Optional, Dict, Any
from pydantic import BaseModel
from services.ai_service import test_provider_key, fetch_provider_models, PROVIDER_DEFAULTS
from models.schemas import SuccessResponse

router = APIRouter(prefix="/api/ai", tags=["ai"])


class TestKeyRequest(BaseModel):
    provider: str
    api_key: str
    model: Optional[str] = None


class FetchModelsRequest(BaseModel):
    provider: str
    api_key: str


@router.post("/test-key")
async def test_key_endpoint(body: TestKeyRequest):
    result = await test_provider_key(
        provider=body.provider,
        api_key=body.api_key,
        model=body.model,
    )
    return {"success": result.get("success", False), "data": result}


@router.post("/fetch-models")
async def fetch_models_endpoint(body: FetchModelsRequest):
    result = await fetch_provider_models(
        provider=body.provider,
        api_key=body.api_key,
    )
    return {"success": result.get("success", False), "data": result}


@router.get("/providers", response_model=SuccessResponse)
async def get_providers_endpoint():
    return SuccessResponse(data=PROVIDER_DEFAULTS)

