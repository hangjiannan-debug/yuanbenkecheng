from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class CurriculumPlan(Base):
    """园本课程方案表"""
    __tablename__ = "curriculum_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    kinder_id = Column(Integer, ForeignKey("kinders.id"), nullable=False)
    title = Column(String(200), nullable=False)
    
    # 园所信息（JSON 存储）
    basic_info = Column(JSON)  # 园所基本信息
    features = Column(JSON)    # 园所特色
    resources = Column(JSON)   # 地域资源
    goals = Column(JSON)       # 培养目标
    micro_env = Column(JSON)   # 微观环境补充
    
    # 生成的方案内容
    plan_content = Column(Text)  # HTML 格式的方案内容
    ai_optimized = Column(JSON)  # AI 优化后的内容
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    kinder = relationship("Kinder", back_populates="plans")
    courses = relationship("CourseContent", back_populates="plan")
