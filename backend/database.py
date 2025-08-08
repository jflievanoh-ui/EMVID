import os
import motor.motor_asyncio
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import MongoClient  # Sync operations for index creation

# Read from environment variables
MONGO_URL = os.environ.get("MONGO_URL")  # Atlas connection string in Render
DB_NAME = os.environ.get("DB_NAME", "virtual_studio")  # Default database name
USER_COLLECTION_NAME = "users"  # Name of the user collection

# Clients
client: AsyncIOMotorClient = None
database: AsyncIOMotorDatabase = None
sync_client: MongoClient = None

async def connect_to_mongo():
    """Create async and sync MongoDB connections."""
    global client, database, sync_client

    if not MONGO_URL:
        raise EnvironmentError(
            "MONGO_URL environment variable not set. Please provide the MongoDB connection string."
        )

    try:
        # Async client for normal app use
        client = AsyncIOMotorClient(MONGO_URL)
        database = client[DB_NAME]

        # Sync client for index creation
        sync_client = MongoClient(MONGO_URL)

        # Ensure indexes exist
        await create_indexes()

        print(f"✅ Connected to MongoDB database '{DB_NAME}'")
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        raise  # Fail app startup if DB connection fails

async def close_mongo_connection():
    """Close MongoDB connections."""
    if client:
        client.close()
    if sync_client:
        sync_client.close()
    print("🔌 MongoDB connections closed")

async def create_indexes():
    """Create necessary database indexes for optimal performance."""
    if database is None:
        print("⚠️ Database not initialized. Skipping index creation.")
        return

    # Sync version for some indexes
    sync_database = sync_client[DB_NAME]
    sync_user_collection = sync_database[USER_COLLECTION_NAME]

    try:
        sync_user_collection.create_index("name", unique=True)
        print("📌 Unique index created on 'users.name'")
    except Exception as e:
        print(f"⚠️ Error creating unique index on 'users.name': {e}")

    # Rooms
    await database["rooms"].create_index("invite_code", unique=True)
    await database["rooms"].create_index("director_id")
    await database["rooms"].create_index("status")

    # Participants
    await database["participants"].create_index("room_id")
    await database["participants"].create_index([("room_id", 1), ("name", 1)])

    # Audio Sources
    await database["audio_sources"].create_index("room_id")
    await database["audio_sources"].create_index("participant_id")

    # Video Sources
    await database["video_sources"].create_index("room_id")
    await database["video_sources"].create_index("participant_id")

    # Routes
    await database["routes"].create_index("room_id")
    await database["routes"].create_index("source_id")

    # Sessions
    await database["sessions"].create_index("room_id", unique=True)

    # Signaling (WebRTC)
    await database["signaling"].create_index([("room_id", 1), ("created_at", -1)])
    await database["signaling"].create_index([("participant_id", 1), ("created_at", -1)])
    await database["signaling"].create_index("created_at", expireAfterSeconds=3600)

async def get_database() -> AsyncIOMotorDatabase:
    """Return the database instance."""
    if database is None:
        raise Exception("Database connection not initialized. Call connect_to_mongo() first.")
    return database
