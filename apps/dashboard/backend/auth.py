"""
auth.py — Authentication router for CrowdSense.

POST /auth/login  →  { token, admin } | 401
"""
from __future__ import annotations

import datetime
import os

import bcrypt
import jwt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import database

auth_router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-prod")
ALGORITHM  = "HS256"
TOKEN_TTL  = datetime.timedelta(hours=24)


class LoginBody(BaseModel):
    email: str
    password: str


@auth_router.post("/login")
async def login(body: LoginBody):
    """Validate credentials against the admins collection and return a JWT."""

    # 1. Look up admin
    admin = await database.db.admins.find_one({"email": body.email})
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 2. Verify password
    stored_hash: str = admin.get("password_hash", "")
    if not bcrypt.checkpw(body.password.encode(), stored_hash.encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 3. Issue JWT
    payload = {
        "sub":   str(admin["_id"]),
        "email": admin["email"],
        "role":  admin.get("role", "admin"),
        "exp":   datetime.datetime.utcnow() + TOKEN_TTL,
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "token": token,
        "admin": {
            "name":  admin.get("name", "Admin"),
            "email": admin["email"],
            "role":  admin.get("role", "admin"),
        },
    }
