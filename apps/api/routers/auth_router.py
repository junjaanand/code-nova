from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from apps.api.db.database import db
from apps.api.auth.jwt import create_access_token, get_current_user_from_token
from packages.schemas.models import User, RoleEnum

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str = "password"

class RegisterRequest(BaseModel):
    email: str
    name: str
    role: RoleEnum = RoleEnum.CREATOR

@router.post("/login")
def login(req: LoginRequest):
    # Find user by email or fallback to demo user
    user = next((u for u in db.users.values() if u.email.lower() == req.email.lower()), None)
    if not user:
        # For convenience in demo, allow quick login with role names
        if req.email in ["priya", "creator"]:
            user = db.users.get("usr_priya")
        elif req.email in ["rahul", "manager"]:
            user = db.users.get("usr_rahul")
        elif req.email in ["legal", "reviewer"]:
            user = db.users.get("usr_legal")
        elif req.email in ["ananya", "admin"]:
            user = db.users.get("usr_ananya")
        elif req.email in ["auditor"]:
            user = db.users.get("usr_auditor")
            
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user credentials")

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/register")
def register(req: RegisterRequest):
    if any(u.email.lower() == req.email.lower() for u in db.users.values()):
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=req.email,
        name=req.name,
        role=req.role
    )
    db.users[new_user.id] = new_user
    token = create_access_token({"sub": new_user.id, "email": new_user.email, "role": new_user.role})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.get("/me")
def get_current_user(current_user: User = Depends(get_current_user_from_token)):
    return current_user
