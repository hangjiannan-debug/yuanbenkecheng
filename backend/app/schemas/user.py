from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    role: str = Field(default="teacher", pattern="^(principal|teacher)$")
    kinder_name: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    role: str
    kinder_id: Optional[int] = None


class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    kinder_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
