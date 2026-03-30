import os
import jwt
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, MetaData, Table
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session

app = FastAPI()

DB_URL = os.environ.get("DB_URL")
JWT_SECRET = os.environ.get("JWT_SECRET", "supersecretjwt")

engine = create_engine(DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DeploymentTask(Base):
    __tablename__ = "deployment_tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), index=True)
    status = Column(String(50))
    sprint = Column(String(50))

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

class TaskCreate(BaseModel):
    title: str
    status: str
    sprint: str

class TaskResponse(TaskCreate):
    id: int

    class Config:
        from_attributes = True

@app.get("/health")
def health():
    return {"status": "Project Service Healthy"}

@app.get("/", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    # Currently allowing read access for dashboard without token to simplify UI initial load
    # In a real app, this might also require auth, but dashboard might need public metrics
    return db.query(DeploymentTask).all()

@app.post("/", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_task = DeploymentTask(title=task.title, status=task.status, sprint=task.sprint)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_task = db.query(DeploymentTask).filter(DeploymentTask.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"detail": "Task deleted"}
