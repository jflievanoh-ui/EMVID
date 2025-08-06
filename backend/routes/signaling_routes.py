from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List

router = APIRouter()

# Store active connections per room
connections: Dict[str, List[WebSocket]] = {}

@router.websocket("/ws/{room_id}/{participant_id}")
async def signaling_ws(websocket: WebSocket, room_id: str, participant_id: str):
    await websocket.accept()

    # Register connection
    if room_id not in connections:
        connections[room_id] = []
    connections[room_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_json()

            # Broadcast to all other participants in the room
            for connection in connections[room_id]:
                if connection != websocket:
                    await connection.send_json({
                        "from": participant_id,
                        "data": data
                    })

    except WebSocketDisconnect:
        connections[room_id].remove(websocket)
        if not connections[room_id]:
            del connections[room_id]
