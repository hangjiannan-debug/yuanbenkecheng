from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, Kinder
from app.schemas.user import UserCreate, LoginRequest, Token, UserResponse

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """注册"""
    # 检查用户名是否已存在
    result = await db.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    # 如果是园长，创建幼儿园
    kinder_id = None
    if user_data.role == "principal" and user_data.kinder_name:
        kinder = Kinder(name=user_data.kinder_name)
        db.add(kinder)
        await db.flush()
        kinder_id = kinder.id
    
    # 创建用户
    user = User(
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role,
        kinder_id=kinder_id,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # 生成 token
    token = create_access_token(data={"sub": str(user.id), "kinder_id": kinder_id, "role": user.role})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        username=user.username,
        role=user.role,
        kinder_id=kinder_id,
    )


@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """登录"""
    result = await db.execute(select(User).where(User.username == login_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    
    token = create_access_token(data={"sub": str(user.id), "kinder_id": user.kinder_id, "role": user.role})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        username=user.username,
        role=user.role,
        kinder_id=user.kinder_id,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    db: AsyncSession = Depends(get_db),
    # TODO: 添加 JWT 依赖注入
):
    """获取当前用户信息"""
    # TODO: 从 token 解析用户
    pass
