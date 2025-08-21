# backend/services/__init__.py
"""
Paquete services: centraliza la importación de los servicios de la aplicación
"""

# Socket manager
from .sockets_manager import sio_manager

# Servicios de lógica
from .audio_service import AudioService
from .room_service import RoomService
from .routing_service import RoutingService
from .session_service import SessionService
from .video_service import VideoService

# Ahora desde cualquier parte de tu proyecto puedes hacer:
# from services import sio_manager, AudioService, RoomService, ...
