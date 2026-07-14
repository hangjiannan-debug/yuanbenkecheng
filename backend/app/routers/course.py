from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.course import CourseContent, ImplementationRecord
from app.schemas.course import CourseCreate, CourseResponse, RecordCreate, RecordResponse

router = APIRouter()


@router.post("/contents", response_model=CourseResponse)
async def create_course(course_data: CourseCreate, db: AsyncSession = Depends(get_db)):
    """创建课程内容"""
    course = CourseContent(
        plan_id=course_data.plan_id,
        theme=course_data.theme,
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course


@router.get("/contents/plan/{plan_id}", response_model=List[CourseResponse])
async def list_courses(plan_id: int, db: AsyncSession = Depends(get_db)):
    """获取方案下的课程内容列表"""
    result = await db.execute(
        select(CourseContent).where(CourseContent.plan_id == plan_id).order_by(CourseContent.created_at.desc())
    )
    return result.scalars().all()


@router.post("/records", response_model=RecordResponse)
async def create_record(record_data: RecordCreate, db: AsyncSession = Depends(get_db)):
    """创建实施记录"""
    record = ImplementationRecord(
        course_id=record_data.course_id,
        record_type=record_data.record_type,
        title=record_data.title,
        content=record_data.content,
        file_url=record_data.file_url,
        tags=record_data.tags,
        note=record_data.note,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


@router.get("/records/course/{course_id}", response_model=List[RecordResponse])
async def list_records(course_id: int, db: AsyncSession = Depends(get_db)):
    """获取课程下的实施记录列表"""
    result = await db.execute(
        select(ImplementationRecord).where(ImplementationRecord.course_id == course_id).order_by(ImplementationRecord.created_at.desc())
    )
    return result.scalars().all()
