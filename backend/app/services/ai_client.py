"""AI 调用层 - 统一接口，支持多模型切换"""
import httpx
from typing import List, Dict, Optional
from app.core.config import settings


class AIClient:
    """AI 客户端基类"""
    
    async def chat(self, messages: List[Dict[str, str]], max_tokens: int = 4000, temperature: float = 0.7) -> str:
        raise NotImplementedError


class DeepSeekClient(AIClient):
    """DeepSeek API 客户端"""
    
    def __init__(self):
        self.api_key = settings.deepseek_api_key
        self.base_url = settings.deepseek_base_url
        self.model = settings.deepseek_model
    
    async def chat(self, messages: List[Dict[str, str]], max_tokens: int = 4000, temperature: float = 0.7) -> str:
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }
        data = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, headers=headers, json=data)
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]


# 全局 AI 客户端实例
ai_client = DeepSeekClient()


async def call_ai(system_prompt: str, user_prompt: str, max_tokens: int = 4000) -> str:
    """调用 AI 的统一入口"""
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": user_prompt})
    
    try:
        return await ai_client.chat(messages, max_tokens=max_tokens)
    except Exception as e:
        # 降级：返回提示信息
        return f"AI 调用失败: {str(e)}"
