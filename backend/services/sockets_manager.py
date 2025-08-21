from typing import Dict, Set, Optional
import asyncio
from datetime import datetime, timedelta

class SocketManager:
    """Maneja conexiones de Socket.IO, salas, TTL, forwarding y reconexiones."""

    def __init__(self, room_ttl_seconds: int = 300):
        """
        room_ttl_seconds: tiempo que una sala permanece activa sin usuarios antes de eliminarla
        """
        self.rooms: Dict[str, Set[str]] = {}        # {room_id: set(sid)}
        self.users: Dict[str, dict] = {}           # {sid: metadata}
        self.room_last_active: Dict[str, datetime] = {}  # {room_id: última actividad}
        self.room_ttl = timedelta(seconds=room_ttl_seconds)
        self._cleanup_task = asyncio.create_task(self._cleanup_rooms_loop())

    # ---- Conexión y desconexión ----
    async def on_connect(self, sid: str, environ: dict):
        """Cliente conectado"""
        print(f"[SocketManager] Cliente conectado: {sid}")
        self.users[sid] = {"connected_at": datetime.utcnow()}

    async def on_disconnect(self, sid: str):
        """Cliente desconectado"""
        print(f"[SocketManager] Cliente desconectado: {sid}")
        self.users.pop(sid, None)

        for room_id, sids in self.rooms.items():
            if sid in sids:
                sids.remove(sid)
                self.room_last_active[room_id] = datetime.utcnow()
                print(f"[SocketManager] Cliente {sid} removido de la sala {room_id}")

    # ---- Unirse a sala ----
    async def join_room(self, sid: str, room_id: str):
        """Agrega un cliente a una sala"""
        if room_id not in self.rooms:
            self.rooms[room_id] = set()
        self.rooms[room_id].add(sid)
        self.room_last_active[room_id] = datetime.utcnow()
        print(f"[SocketManager] Cliente {sid} se unió a la sala {room_id}")

    # ---- Forward de mensajes ----
    async def forward_to_peer(self, event: str, data: dict):
        """
        Envía un evento a los peers de una sala.
        data debe tener:
        - room_id
        - payload
        - target_sid (opcional)
        """
        room_id: Optional[str] = data.get("room_id")
        target_sid: Optional[str] = data.get("target_sid")
        payload = data.get("payload")

        if not room_id or payload is None:
            print("[SocketManager] Error: room_id o payload faltante")
            return

        if room_id not in self.rooms:
            print(f"[SocketManager] Error: la sala {room_id} no existe")
            return

        from backend.main import sio  # evitar circular import
        for sid in self.rooms[room_id]:
            if target_sid and sid != target_sid:
                continue
            await sio.emit(event, payload, to=sid)
            print(f"[SocketManager] Evento '{event}' enviado a {sid} en {room_id}")

    # ---- Limpieza automática de salas ----
    async def _cleanup_rooms_loop(self):
        """Elimina salas vacías después de que expire el TTL"""
        while True:
            await asyncio.sleep(30)  # ciclo de limpieza cada 30s
            now = datetime.utcnow()
            rooms_to_delete = []
            for room_id, sids in self.rooms.items():
                if not sids:
                    last_active = self.room_last_active.get(room_id, now)
                    if now - last_active > self.room_ttl:
                        rooms_to_delete.append(room_id)

            for room_id in rooms_to_delete:
                print(f"[SocketManager] Eliminando sala {room_id} por inactividad")
                self.rooms.pop(room_id, None)
                self.room_last_active.pop(room_id, None)

# ---- Instancia global ----
sio_manager = SocketManager(room_ttl_seconds=300)  # salas expiran a los 5 min
