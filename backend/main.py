# backend/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from pathlib import Path
from dotenv import load_dotenv

from .database import connect_to_mongo, close_mongo_connection
from .routes import auth_routes, room_routes, audio_routes, video_routes, routing_routes, session_routes

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting Virtual Studio backend...")
    try:
        await connect_to_mongo()
        logger.info("✅ Connected to MongoDB")
    except Exception as e:
        logger.error(f"⚠️ Could not connect to MongoDB: {e}")
        logger.warning("The app will still run, but database features will be unavailable.")
    yield
    logger.info("🛑 Shutting down Virtual Studio backend...")
    try:
        await close_mongo_connection()
        logger.info("✅ Disconnected from MongoDB")
    except Exception as e:
        logger.error(f"⚠️ Error while closing MongoDB connection: {e}")

app = FastAPI(
    title="Virtual Studio API",
    description="Professional virtual studio for OBS integration and live streaming",
    version="1.0.0",
    lifespan=lifespan
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://emvid-frontend.onrender.com")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(room_routes.router, prefix="/api/rooms", tags=["Rooms"])
app.include_router(audio_routes.router, prefix="/api/audio", tags=["Audio"])
app.include_router(video_routes.router, prefix="/api/video", tags=["Video"])
app.include_router(routing_routes.router, prefix="/api/routing", tags=["Routing"])
app.include_router(session_routes.router, prefix="/api/sessions", tags=["Sessions"])

@app.get("/api/")
async def root():
    return {"message": "Virtual Studio API is running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Virtual Studio API", "version": "1.0.0"}
