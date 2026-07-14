from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Kinder(Base):
    """幼儿园表"""
    __tablename__ = "kinders"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    address = Column(String(200))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    users = relationship("User", back_populates="kinder")
    plans = relationship("CurriculumPlan", back_populates="kinder")


class User(Base):
    """用户表"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(200), nullable=False)
    role = Column(String(20), nullable=False, default="teacher")  # principal / teacher
    kinder_id = Column(Integer, ForeignKey("kinders.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    kinder = relationship("Kinder", back_populates="users")
