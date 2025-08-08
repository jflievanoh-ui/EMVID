import os
import motor.motor_asyncio
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "virtual_studio")  # Default database name

client: AsyncIOMotorClient = None
database: AsyncIOMotorDatabase = None


async def connect_to_mongo():
    """Create database connection"""
    global client, database

    if MONGO_URL is None:  # Correct way to check for None
        raise EnvironmentError(
            "MONGO_URL environment variable not set.  Please provide the MongoDB connection string."
        )

    try:
        client = AsyncIOMotorClient(MONGO_URL)
        database = client[DB_NAME]
        await create_indexes()
        print("Connected to MongoDB")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise  # Re-raise the exception to prevent the app from starting without a database connection


async def close_mongo_connection():
    """Close database connection"""
    if client:
        client.close()


async def create_indexes():
    """Create database indexes for optimal performance"""
    if database is None:  # Correct way to check for None
        print("Database not initialized. Skipping index creation.")
        return

    # Rooms collection indexes
    await database.rooms.create_index("invite_code", unique=True)
    await database.rooms.create_index("director_id")
    await database.rooms.create_index("status")

    # Participants collection indexes
    await database.participants.create_index("room_id")
    await database.participants.create_index([("room_id", 1), ("name", 1)])

    # Audio sources collection indexes
    await database.audio_sources.create_index("room_id")
    await database.audio_sources.create_index("participant_id")

    # Video sources collection indexes
    await database.video_sources.create_index("room_id")
    await database.video_sources.create_index("participant_id")

    # Routes collection indexes
    await database.routes.create_index("room_id")
    await database.routes.create_index("source_id")

    # Sessions collection indexes
    await database.sessions.create_index("room_id", unique=True)

    # Signaling collection indexes (for WebRTC)
    await database.signaling.create_index([("room_id", 1), ("created_at", -1)])
    await database.signaling.create_index([("participant_id", 1), ("created_at", -1)])

    # TTL index for signaling messages (auto-delete after 1 hour)
    await database.signaling.create_index("created_at", expireAfterSeconds=3600)


async def get_database() -> AsyncIOMotorDatabase:
    """Returns the database instance."""
    if database is None:
        raise Exception("Database connection not initialized. Call connect_to_mongo() first.")
    return database