# backend/main.py
import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

# ---- Load environment ----
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ---- Import API routers y sockets manager ----
from routes import api_router  # ahora importa el api_router desde __init__.py de routes
from services.sockets_manager import sio_manager

# ---- FastAPI config ----
app = FastAPI(
    title="EMVID API",
    description="Backend para videoconferencias y streaming",
    version="1.0.0",
)

# ---- CORS ----
origins = [
    "https://emvid-frontend.onrender.com",  # frontend producción
    "http://localhost:3000",                # desarrollo local
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- REST API ----
app.include_router(api_router, prefix="/api")

# ---- Socket.IO ----
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=origins,
)
asgi_app = socketio.ASGIApp(sio, other_asgi_app=app)

# ---- Socket.IO events ----
@sio.event
async def connect(sid, environ):
    await sio_manager.on_connect(sid, environ)

@sio.event
async def disconnect(sid):
    await sio_manager.on_disconnect(sid)

@sio.event
async def join_room(sid, data):
    await sio_manager.join_room(sid, data["room_id"])

@sio.event
async def offer(sid, data):
    await sio_manager.forward_to_peer("offer", data)

@sio.event
async def answer(sid, data):
    await sio_manager.forward_to_peer("answer", data)

@sio.event
async def ice_candidate(sid, data):
    await sio_manager.forward_to_peer("ice-candidate", data)

# ---- Healthcheck ----
@app.get("/health")
async def health():
    return {"status": "ok"}

# ---- Run local (solo desarrollo) ----
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(asgi_app, host="0.0.0.0", port=10000)
