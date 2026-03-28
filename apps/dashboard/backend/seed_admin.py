"""
seed_admin.py — Create the default admin account once.

Usage:
    cd backend
    python seed_admin.py

Default credentials:
    Email:    admin@crowdsense.com
    Password: admin123
"""
from __future__ import annotations

import asyncio
import datetime

import bcrypt
from dotenv import load_dotenv

load_dotenv()


async def seed() -> None:
    import database

    await database.connect()

    existing = await database.db.users.find_one({"email": "admin@crowdsense.com"})
    if existing:
        print("[seed] Admin already exists — skipping.")
        return

    hashed = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode()
    await database.db.users.insert_one(
        {
            "name": "Admin User",
            "email": "admin@crowdsense.com",
            "password_hash": hashed,
            "role": "superadmin",
            "created_at": datetime.datetime.utcnow(),
        }
    )
    print("[seed] ✓ Default admin created:")
    print("       Email:    admin@crowdsense.com")
    print("       Password: admin123")


if __name__ == "__main__":
    asyncio.run(seed())
