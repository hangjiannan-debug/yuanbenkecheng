from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CourseCreate(BaseModel):
    plan_id: int
    theme: str = Field(..., max_length=100)


class CourseResponse(BaseModel):
    id: int
    plan_id: int
    theme: str
    lesson_plan: Optional[str] = None
    resource_pack: Optional[str] = None
    ai_optimized: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class RecordCreate(BaseModel):
    course_id: int
    record_type: str = Field(..., pattern="^(work|observation|reflection|photo|video)$")
    title: Optional[str] = None
    content: Optional[str] = None
    file_url: Optional[str] = None
    tags: Optional[List[str]] = None
    note: Optional[str] = None


class RecordResponse(BaseModel):
    id: int
    course_id: int
    record_type: str
    title: Optional[str] = None
    content: Optional[str] = None
    file_url: Optional[str] = None
    tags: Optional[List[str]] = None
    note: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
