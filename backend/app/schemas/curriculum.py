from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class PlanCreate(BaseModel):
    title: str = Field(..., max_length=200)
    basic_info: Dict[str, Any]
    features: Dict[str, Any]
    resources: Dict[str, Any]
    goals: Dict[str, Any]
    micro_env: Optional[Dict[str, Any]] = None


class PlanResponse(BaseModel):
    id: int
    kinder_id: int
    title: str
    basic_info: Dict[str, Any]
    features: Dict[str, Any]
    resources: Dict[str, Any]
    goals: Dict[str, Any]
    micro_env: Optional[Dict[str, Any]] = None
    plan_content: Optional[str] = None
    ai_optimized: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PlanListResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    
    class Config:
        from_attributes = True
