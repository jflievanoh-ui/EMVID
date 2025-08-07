# backend/main.py
import logging
from fastapi import FastAPI
from contextlib import asynccontextmanager

# make sure your import paths match your package layout
from backend.database import connect_to_mongo  # if your package structure differs adjust import
# routers will be included after app creation to avoid import-time DB calls
# from backend.routes import room_routes, signaling_routes, auth_routes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting application (lifespan startup)...")
    try:
        await connect_to_mongo()
    except Exception as e:
        logger.error(f"Database connection failed during startup: {e}")
        # Decide: re-raise if you want app to fail fast
        raise
    yield
    logger.info("Application shutdown (lifespan cleanup).")

app = FastAPI(title="EMVID Virtual Studio", lifespan=lifespan)

# Include routers here — adjust import style to avoid circular imports
try:
    from backend.routes import room_routes, signaling_routes, auth_routes  # optional if present
    app.include_router(room_routes.router, prefix="/rooms", tags=["rooms"])
    app.include_router(signaling_routes.router, prefix="", tags=["signaling"])
    app.include_router(auth_routes.router, prefix="/auth", tags=["auth"])
except Exception as e:
    logger.warning(f"One or more routers could not be imported/registered at startup: {e}")
