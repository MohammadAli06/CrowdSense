"""
auth.py — Authentication router for CrowdSense.

POST /auth/login     →  { token, user }   | 401
POST /auth/register  →  { token, user }   | 400 / 409
"""
from __future__ import annotations

import datetime
import os
import re

import bcrypt
import jwt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import database

auth_router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-prod")
ALGORITHM = "HS256"
TOKEN_TTL = datetime.timedelta(hours=24)


# ── Request bodies ──────────────────────────────────────────────────

class LoginBody(BaseModel):
    email: str
    password: str


class RegisterBody(BaseModel):
    name: str
    email: str
    password: str


# ── Helpers ─────────────────────────────────────────────────────────

def _make_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.datetime.utcnow() + TOKEN_TTL,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


# ── Login ───────────────────────────────────────────────────────────

@auth_router.post("/login")
async def login(body: LoginBody):
    """Validate credentials and return a JWT."""

    if database.db is None:
        raise HTTPException(status_code=503, detail="Database not connected.")

    user = await database.db.users.find_one({"email": body.email.lower().strip()})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    stored_hash: str = user.get("password_hash", "")
    if not bcrypt.checkpw(body.password.encode(), stored_hash.encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = _make_token(str(user["_id"]), user["email"], user.get("role", "user"))

    return {
        "token": token,
        "user": {
            "name": user.get("name", "User"),
            "email": user["email"],
            "role": user.get("role", "user"),
        },
    }


# ── Register ────────────────────────────────────────────────────────

@auth_router.post("/register")
async def register(body: RegisterBody):
    """Create a new user account and return a JWT."""

    if database.db is None:
        raise HTTPException(status_code=503, detail="Database not connected.")

    # Basic validation
    name = body.name.strip()
    email = body.email.lower().strip()
    password = body.password

    if not name or len(name) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters")

    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Invalid email address")

    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    # Check for existing user
    existing = await database.db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    # Create user
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    result = await database.db.users.insert_one(
        {
            "name": name,
            "email": email,
            "password_hash": hashed,
            "role": "user",
            "created_at": datetime.datetime.utcnow(),
        }
    )

    token = _make_token(str(result.inserted_id), email, "user")

    return {
        "token": token,
        "user": {
            "name": name,
            "email": email,
            "role": "user",
        },
    }
