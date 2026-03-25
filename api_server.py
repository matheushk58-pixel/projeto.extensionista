#!/usr/bin/env python3
"""Leaderboard API server for Drogaria Runner."""
import os
import sqlite3
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "leaderboard.db")

def get_db():
    db = sqlite3.connect(DB_PATH, check_same_thread=False)
    db.execute("PRAGMA journal_mode=WAL")
    db.execute("""
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            score INTEGER NOT NULL,
            distance INTEGER NOT NULL,
            phase TEXT NOT NULL,
            character TEXT NOT NULL DEFAULT 'male',
            visitor_id TEXT NOT NULL DEFAULT '',
            created_at REAL NOT NULL
        )
    """)
    db.commit()
    return db

db = get_db()

@asynccontextmanager
async def lifespan(app):
    yield
    db.close()

app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ScoreSubmission(BaseModel):
    name: str = Field(..., min_length=1, max_length=20)
    score: int = Field(..., ge=0)
    distance: int = Field(..., ge=0)
    phase: str = ""
    character: str = "male"

@app.get("/api/leaderboard")
def get_leaderboard(limit: int = 20):
    """Get top scores."""
    rows = db.execute(
        "SELECT id, name, score, distance, phase, character, created_at FROM scores ORDER BY score DESC LIMIT ?",
        [min(limit, 100)]
    ).fetchall()
    return [
        {
            "id": r[0], "name": r[1], "score": r[2], "distance": r[3],
            "phase": r[4], "character": r[5], "created_at": r[6]
        }
        for r in rows
    ]

@app.post("/api/leaderboard", status_code=201)
def submit_score(entry: ScoreSubmission, request: Request):
    """Submit a new score."""
    visitor_id = request.headers.get("X-Visitor-Id", "unknown")
    now = time.time()
    cur = db.execute(
        "INSERT INTO scores (name, score, distance, phase, character, visitor_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [entry.name.strip()[:20], entry.score, entry.distance, entry.phase, entry.character, visitor_id, now]
    )
    db.commit()
    # Return rank
    rank = db.execute(
        "SELECT COUNT(*) FROM scores WHERE score > ?", [entry.score]
    ).fetchone()[0] + 1
    return {"id": cur.lastrowid, "rank": rank}

@app.get("/api/leaderboard/rank/{score}")
def get_rank(score: int):
    """Check rank for a given score."""
    rank = db.execute(
        "SELECT COUNT(*) FROM scores WHERE score > ?", [score]
    ).fetchone()[0] + 1
    total = db.execute("SELECT COUNT(*) FROM scores").fetchone()[0]
    return {"rank": rank, "total": total}

# === Serve Game Static Files ===

@app.get("/")
async def read_index():
    return FileResponse(os.path.join(BASE_DIR, "index.html"))

# Mount videos and cutscenes (if they exist) or just everything in BASE_DIR for now
# We exclude the python files by not serving .py if we use StaticFiles carefully
# Actually, let's mount the current folder but be careful.
# Better to mount specifically.
app.mount("/", StaticFiles(directory=BASE_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
