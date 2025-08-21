from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from pathlib import Path
from dotenv import load_dotenv

# Import database connection
from database import connect_to_mongo, close_mongo_connection

# Import route modules
from routes import auth_routes, room_routes, audio_routes, video_routes, routing_routes, session_routes

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Virtual Studio backend...")
    await connect_to_mongo()
    logger.info("Connected to MongoDB")
    yield
    # Shutdown
    logger.info("Shutting down Virtual Studio backend...")
    await close_mongo_connection()
    logger.info("Disconnected from MongoDB")

# Create FastAPI app with lifespan events
app = FastAPI(
    title="Virtual Studio API",
    description="Professional virtual studio for OBS integration and live streaming",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # Configure for production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all route modules with /api prefix
app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(room_routes.router, prefix="/api/rooms", tags=["Rooms"])
app.include_router(audio_routes.router, prefix="/api/audio", tags=["Audio"])
app.include_router(video_routes.router, prefix="/api/video", tags=["Video"])
app.include_router(routing_routes.router, prefix="/api/routing", tags=["Routing"])
app.include_router(session_routes.router, prefix="/api/sessions", tags=["Sessions"])

# Health check endpoint
@app.get("/api/")
async def root():
    return {"message": "Virtual Studio API is running"}

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Virtual Studio API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)