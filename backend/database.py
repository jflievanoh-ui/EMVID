from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os
from typing import Optional

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None

db = Database()

async def get_database() -> AsyncIOMotorDatabase:
    return db.database

async def connect_to_mongo():
    """Create database connection"""
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'virtual_studio')
    
    db.client = AsyncIOMotorClient(mongo_url)
    db.database = db.client[db_name]
    
    # Create indexes for performance
    await create_indexes()

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()

async def create_indexes():
    """Create database indexes for optimal performance"""
    if not db.database:
        return
    
    # Rooms collection indexes
    await db.database.rooms.create_index("invite_code", unique=True)
    await db.database.rooms.create_index("director_id")
    await db.database.rooms.create_index("status")
    
    # Participants collection indexes
    await db.database.participants.create_index("room_id")
    await db.database.participants.create_index([("room_id", 1), ("name", 1)])
    
    # Audio sources collection indexes
    await db.database.audio_sources.create_index("room_id")
    await db.database.audio_sources.create_index("participant_id")
    
    # Video sources collection indexes
    await db.database.video_sources.create_index("room_id")
    await db.database.video_sources.create_index("participant_id")
    
    # Routes collection indexes
    await db.database.routes.create_index("room_id")
    await db.database.routes.create_index("source_id")
    
    # Sessions collection indexes
    await db.database.sessions.create_index("room_id", unique=True)
    
    # Signaling collection indexes (for WebRTC)
    await db.database.signaling.create_index([("room_id", 1), ("created_at", -1)])
    await db.database.signaling.create_index([("participant_id", 1), ("created_at", -1)])
    
    # TTL index for signaling messages (auto-delete after 1 hour)
    await db.database.signaling.create_index("created_at", expireAfterSeconds=3600)