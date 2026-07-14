from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, curriculum, course

app = FastAPI(
    title="园本课程建设平台",
    description="面向幼儿园的园本课程建设 SaaS 平台",
    version="1.0.0",
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(curriculum.router, prefix="/api/curriculum", tags=["园本课程"])
app.include_router(course.router, prefix="/api/course", tags=["课程生成"])


@app.get("/")
async def root():
    return {"message": "园本课程建设平台 API"}


@app.get("/health")
async def health():
    return {"status": "ok"}
