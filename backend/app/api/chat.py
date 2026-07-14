"""AI 聊天 API 端点"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.services.ai_client import call_ai

router = APIRouter()


class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    max_tokens: Optional[int] = 4000
    temperature: Optional[float] = 0.7


class ChatResponse(BaseModel):
    content: str
    success: bool


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """AI 聊天接口 - 兼容原有前端调用"""
    try:
        # 提取 system 和 user prompt
        system_prompt = ""
        user_prompt = ""
        for msg in request.messages:
            if msg["role"] == "system":
                system_prompt = msg["content"]
            elif msg["role"] == "user":
                user_prompt = msg["content"]
        
        content = await call_ai(system_prompt, user_prompt, request.max_tokens)
        return ChatResponse(content=content, success=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
