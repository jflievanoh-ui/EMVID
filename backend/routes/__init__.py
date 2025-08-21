# backend/routes/__init__.py
from fastapi import APIRouter

# Importar todos los routers individuales
from .audio_routes import router as audio_router
from .auth_routes import router as auth_router
from .room_routes import router as room_router
from .routing_routes import router as routing_router
from .session_routes import router as session_router
from .video_routes import router as video_router

# Crear el router principal
api_router = APIRouter()

# Incluir todos los routers individuales con su prefijo
api_router.include_router(auth_router, prefix="/auth")
api_router.include_router(audio_router, prefix="/audio")
api_router.include_router(video_router, prefix="/video")
api_router.include_router(room_router, prefix="/room")
api_router.include_router(session_router, prefix="/session")
api_router.include_router(routing_router, prefix="/routing")
