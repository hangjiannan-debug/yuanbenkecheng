from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class CourseContent(Base):
    """课程内容表"""
    __tablename__ = "course_contents"
    
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("curriculum_plans.id"), nullable=False)
    theme = Column(String(100), nullable=False)  # 课程主题
    
    # 生成内容
    lesson_plan = Column(Text)      # 教案内容
    resource_pack = Column(Text)    # 资源包内容
    ai_optimized = Column(JSON)     # AI 优化内容
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    plan = relationship("CurriculumPlan", back_populates="courses")
    records = relationship("ImplementationRecord", back_populates="course")


class ImplementationRecord(Base):
    """实施记录表"""
    __tablename__ = "implementation_records"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("course_contents.id"), nullable=False)
    record_type = Column(String(50), nullable=False)  # work/observation/reflection/photo/video
    title = Column(String(200))
    content = Column(Text)
    file_url = Column(String(500))  # OSS 文件 URL
    tags = Column(JSON)             # 标签列表
    note = Column(Text)             # 备注
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    course = relationship("CourseContent", back_populates="records")
