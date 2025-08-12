
import os
from motor.motor_asyncio import AsyncIOMotorClient
import logging

logger = logging.getLogger(__name__)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "emvid")

if not MONGO_URI:
    # In Render we require MONGO_URI to be set. For local development fallback to localhost.
    MONGO_URI = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(MONGO_URI)
database = client[DB_NAME]

async def get_database():
    return database

async def connect_to_mongo():
    # Try a quick server_info to validate connection. Don't crash the process with an unhandled exception.
    try:
        await client.server_info()
        logger.info("Connected to MongoDB")
    except Exception as e:
        logger.error(f"Could not connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    client.close()
