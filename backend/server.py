from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from contextlib import asynccontextmanager

# Import models
from .models import *

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'virtual_studio')]

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
    logger.info("Connected to MongoDB")
    yield
    # Shutdown
    logger.info("Shutting down Virtual Studio backend...")
    client.close()
    logger.info("Disconnected from MongoDB")

# Create the main app without a prefix
app = FastAPI(
    title="Virtual Studio API",
    description="Professional virtual studio for OBS integration and live streaming",
    version="1.0.0",
    lifespan=lifespan
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# In-memory stores for demo (replace with proper database queries in production)
users_db = {}
rooms_db = {}
participants_db = {}
audio_sources_db = {}
video_sources_db = {}
routes_db = {}
sessions_db = {}

# === AUTHENTICATION ROUTES ===

@api_router.post("/auth/register", response_model=User)
async def register_user(user_data: UserCreate):
    """Register a new user (director or participant)"""
    # Check if user already exists by email
    if user_data.email:
        for user in users_db.values():
            if user.get("email") == user_data.email:
                raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        name=user_data.name,
        email=user_data.email,
        role=user_data.role,
        avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data.name}"
    )
    
    users_db[user.id] = user.dict()
    return user

@api_router.post("/auth/login", response_model=User)
async def login_user(login_data: UserLogin):
    """Login user (simplified authentication)"""
    user_record = None
    
    if login_data.email:
        for user in users_db.values():
            if user.get("email") == login_data.email:
                user_record = user
                break
    else:
        for user in users_db.values():
            if user.get("name") == login_data.name:
                user_record = user
                break
    
    if not user_record:
        # For demo purposes, create user if not found
        user_data = UserCreate(
            name=login_data.name,
            email=login_data.email,
            password=login_data.password,
            role=UserRole.DIRECTOR if login_data.password else UserRole.PARTICIPANT
        )
        return await register_user(user_data)
    
    return User(**user_record)

# === ROOM ROUTES ===

@api_router.post("/rooms", response_model=Room)
async def create_room(room_data: RoomCreate, director_id: str = "default_director"):
    """Create a new virtual studio room"""
    invite_code = str(uuid.uuid4())[:6].upper()
    while any(room.get("invite_code") == invite_code for room in rooms_db.values()):
        invite_code = str(uuid.uuid4())[:6].upper()
    
    room = Room(
        name=room_data.name,
        description=room_data.description,
        max_participants=room_data.max_participants,
        invite_code=invite_code,
        director_id=director_id
    )
    
    rooms_db[room.id] = room.dict()
    
    # Initialize session
    session = Session(room_id=room.id)
    sessions_db[room.id] = session.dict()
    
    return room

@api_router.get("/rooms")
async def get_rooms(director_id: str = "default_director"):
    """Get all rooms for a director"""
    rooms = [Room(**room) for room in rooms_db.values() 
             if room.get("director_id") == director_id]
    return rooms

@api_router.get("/rooms/{room_id}", response_model=RoomResponse)
async def get_room_details(room_id: str):
    """Get complete room details"""
    if room_id not in rooms_db:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room = Room(**rooms_db[room_id])
    
    # Get participants for this room
    participants = [Participant(**p) for p in participants_db.values() 
                   if p.get("room_id") == room_id]
    
    # Get audio sources for this room
    audio_sources = [AudioSource(**a) for a in audio_sources_db.values() 
                    if a.get("room_id") == room_id]
    
    # Get video sources for this room
    video_sources = [VideoSource(**v) for v in video_sources_db.values() 
                    if v.get("room_id") == room_id]
    
    # Get routes for this room
    routes = [Route(**r) for r in routes_db.values() 
              if r.get("room_id") == room_id]
    
    return RoomResponse(
        room=room,
        participants=participants,
        audio_sources=audio_sources,
        video_sources=video_sources,
        routes=routes
    )

@api_router.post("/rooms/join", response_model=Participant)
async def join_room(join_data: RoomJoin):
    """Join a room as participant"""
    # Find room by invite code
    room = None
    for r in rooms_db.values():
        if r.get("invite_code") == join_data.room_code.upper():
            room = Room(**r)
            break
    
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Check if room is full
    participant_count = sum(1 for p in participants_db.values() 
                          if p.get("room_id") == room.id)
    if participant_count >= room.max_participants:
        raise HTTPException(status_code=400, detail="Room is full")
    
    # Create participant
    participant = Participant(
        name=join_data.participant_name,
        room_id=room.id,
        avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={join_data.participant_name}"
    )
    
    participants_db[participant.id] = participant.dict()
    
    # Create audio and video sources for the participant
    audio_source = AudioSource(
        name=f"{participant.name} - Microphone",
        type=SourceType.MICROPHONE,
        participant_id=participant.id,
        room_id=room.id
    )
    audio_sources_db[audio_source.id] = audio_source.dict()
    
    video_source = VideoSource(
        name=f"{participant.name} - Camera",
        type=SourceType.CAMERA,
        participant_id=participant.id,
        room_id=room.id
    )
    video_sources_db[video_source.id] = video_source.dict()
    
    return participant

# === AUDIO ROUTES ===

@api_router.get("/audio/room/{room_id}")
async def get_audio_sources(room_id: str):
    """Get all audio sources for a room"""
    sources = [AudioSource(**a) for a in audio_sources_db.values() 
              if a.get("room_id") == room_id]
    return sources

@api_router.post("/audio/{source_id}/toggle-mute", response_model=AudioSource)
async def toggle_mute(source_id: str):
    """Toggle mute status of audio source"""
    if source_id not in audio_sources_db:
        raise HTTPException(status_code=404, detail="Audio source not found")
    
    source = audio_sources_db[source_id]
    source["is_muted"] = not source["is_muted"]
    return AudioSource(**source)

@api_router.post("/audio/{source_id}/volume", response_model=AudioSource)
async def set_volume(source_id: str, volume_data: dict):
    """Set volume of audio source"""
    if source_id not in audio_sources_db:
        raise HTTPException(status_code=404, detail="Audio source not found")
    
    volume = volume_data.get("volume", 0.8)
    if not 0.0 <= volume <= 1.0:
        raise HTTPException(status_code=400, detail="Volume must be between 0 and 1")
    
    source = audio_sources_db[source_id]
    source["volume"] = volume
    return AudioSource(**source)

# === VIDEO ROUTES ===

@api_router.get("/video/room/{room_id}")
async def get_video_sources(room_id: str):
    """Get all video sources for a room"""
    sources = [VideoSource(**v) for v in video_sources_db.values() 
              if v.get("room_id") == room_id]
    return sources

@api_router.post("/video/{source_id}/toggle", response_model=VideoSource)
async def toggle_video_source(source_id: str):
    """Toggle enable status of video source"""
    if source_id not in video_sources_db:
        raise HTTPException(status_code=404, detail="Video source not found")
    
    source = video_sources_db[source_id]
    source["is_enabled"] = not source["is_enabled"]
    return VideoSource(**source)

@api_router.get("/video/{source_id}/obs-url")
async def get_obs_url(source_id: str, base_url: str = "http://localhost:3000"):
    """Get OBS browser source URL for video source"""
    if source_id not in video_sources_db:
        raise HTTPException(status_code=404, detail="Video source not found")
    
    obs_url = f"{base_url}/obs/video/{source_id}"
    return {"obs_url": obs_url}

# === ROUTING ROUTES ===

@api_router.post("/routing", response_model=Route)
async def create_route(route_data: RouteCreate):
    """Create a new audio/video route"""
    route = Route(**route_data.dict())
    routes_db[route.id] = route.dict()
    return route

@api_router.get("/routing/room/{room_id}")
async def get_routes(room_id: str):
    """Get all routes for a room"""
    routes = [Route(**r) for r in routes_db.values() 
             if r.get("room_id") == room_id]
    return routes

@api_router.get("/routing/room/{room_id}/matrix")
async def get_routing_matrix(room_id: str):
    """Get complete routing matrix for a room"""
    audio_sources = [AudioSource(**a) for a in audio_sources_db.values() 
                    if a.get("room_id") == room_id]
    video_sources = [VideoSource(**v) for v in video_sources_db.values() 
                    if v.get("room_id") == room_id]
    routes = [Route(**r) for r in routes_db.values() 
             if r.get("room_id") == room_id]
    participants = [Participant(**p) for p in participants_db.values() 
                   if p.get("room_id") == room_id]
    
    return {
        "audio_sources": [s.dict() for s in audio_sources],
        "video_sources": [s.dict() for s in video_sources],
        "routes": [r.dict() for r in routes],
        "participants": [{"id": p.id, "name": p.name} for p in participants],
        "obs_outputs": [
            {"id": "obs_main", "name": "OBS Main Mix", "type": "obs"},
            {"id": "obs_camera1", "name": "OBS Camera 1", "type": "obs"},
            {"id": "obs_audio1", "name": "OBS Audio 1", "type": "obs"}
        ]
    }

# === SESSION ROUTES ===

@api_router.get("/sessions/{room_id}", response_model=SessionResponse)
async def get_session(room_id: str):
    """Get session details for a room"""
    if room_id not in sessions_db:
        # Create session if it doesn't exist
        session = Session(room_id=room_id)
        sessions_db[room_id] = session.dict()
    
    session = Session(**sessions_db[room_id])
    room = Room(**rooms_db[room_id]) if room_id in rooms_db else None
    participants = [Participant(**p) for p in participants_db.values() 
                   if p.get("room_id") == room_id]
    
    return SessionResponse(
        session=session,
        room=room,
        participants=participants
    )

@api_router.post("/sessions/{room_id}/recording/toggle", response_model=Session)
async def toggle_recording(room_id: str):
    """Toggle recording status"""
    if room_id not in sessions_db:
        session = Session(room_id=room_id)
        sessions_db[room_id] = session.dict()
    
    session = sessions_db[room_id]
    session["is_recording"] = not session["is_recording"]
    
    if session["is_recording"]:
        session["recording_start_time"] = datetime.utcnow().isoformat()
    else:
        session["recording_start_time"] = None
    
    return Session(**session)

@api_router.post("/sessions/{room_id}/streaming/toggle", response_model=Session)
async def toggle_streaming(room_id: str):
    """Toggle streaming status"""
    if room_id not in sessions_db:
        session = Session(room_id=room_id)
        sessions_db[room_id] = session.dict()
    
    session = sessions_db[room_id]
    session["is_streaming"] = not session["is_streaming"]
    
    if session["is_streaming"]:
        session["streaming_start_time"] = datetime.utcnow().isoformat()
    else:
        session["streaming_start_time"] = None
    
    return Session(**session)

# Original status check routes
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Virtual Studio API is running"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Virtual Studio API",
        "version": "1.0.0"
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()