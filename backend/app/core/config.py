from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # 应用配置
    app_name: str = "园本课程建设平台"
    debug: bool = False
    
    # 数据库配置
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/curriculum"
    
    # JWT 配置
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 120
    
    # AI 配置
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-chat"
    
    # CORS 配置
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:8080"]
    
    class Config:
        env_file = ".env"


settings = Settings()
