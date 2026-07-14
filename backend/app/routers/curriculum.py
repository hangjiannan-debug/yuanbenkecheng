from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.curriculum import CurriculumPlan
from app.schemas.curriculum import PlanCreate, PlanResponse, PlanListResponse

router = APIRouter()


@router.post("/plans", response_model=PlanResponse)
async def create_plan(plan_data: PlanCreate, db: AsyncSession = Depends(get_db)):
    """创建园本课程方案"""
    # TODO: 从 token 获取 kinder_id
    kinder_id = 1  # 临时硬编码
    
    plan = CurriculumPlan(
        kinder_id=kinder_id,
        title=plan_data.title,
        basic_info=plan_data.basic_info,
        features=plan_data.features,
        resources=plan_data.resources,
        goals=plan_data.goals,
        micro_env=plan_data.micro_env,
    )
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return plan


@router.get("/plans", response_model=List[PlanListResponse])
async def list_plans(db: AsyncSession = Depends(get_db)):
    """获取方案列表"""
    # TODO: 按 kinder_id 过滤
    result = await db.execute(select(CurriculumPlan).order_by(CurriculumPlan.created_at.desc()))
    return result.scalars().all()


@router.get("/plans/{plan_id}", response_model=PlanResponse)
async def get_plan(plan_id: int, db: AsyncSession = Depends(get_db)):
    """获取方案详情"""
    result = await db.execute(select(CurriculumPlan).where(CurriculumPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="方案不存在")
    return plan


@router.delete("/plans/{plan_id}")
async def delete_plan(plan_id: int, db: AsyncSession = Depends(get_db)):
    """删除方案"""
    result = await db.execute(select(CurriculumPlan).where(CurriculumPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="方案不存在")
    await db.delete(plan)
    await db.commit()
    return {"message": "删除成功"}
