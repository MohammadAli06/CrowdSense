"""
database.py — MongoDB connection for CrowdSense.

Uses motor (async MongoDB driver).
Set MONGO_URI in your environment or .env file.
"""
from __future__ import annotations

import os
import certifi
from dotenv import load_dotenv

load_dotenv()

from motor.motor_asyncio import AsyncIOMotorClient

_client: AsyncIOMotorClient | None = None  # type: ignore[type-arg]
db = None  # populated on connect()


async def connect() -> None:
    global _client, db
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    _client = AsyncIOMotorClient(uri, tlsCAFile=certifi.where())
    db = _client[os.getenv("MONGO_DB", "crowdsense")]
    # Ping to confirm connection
    await _client.admin.command("ping")
    print(f"[DB] Connected to MongoDB ✓")


async def disconnect() -> None:
    global _client
    if _client:
        _client.close()
        print("[DB] MongoDB connection closed")
