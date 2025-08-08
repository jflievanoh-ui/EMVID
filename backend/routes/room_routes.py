from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models import Room, RoomCreate, RoomJoin, RoomResponse, Participant
from services.room_service import room_service
from services.routing_service import routing_service

router = APIRouter()

@router.post("/", response_model=Room)
async def create_room(room_data: RoomCreate, director_id: str = "default_director"):
    """Create a new virtual studio room"""
    try:
        room = await room_service.create_room(room_data, director_id)
        return room
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[Room])
async def get_rooms(director_id: str = "default_director"):
    """Get all rooms for a director"""
    try:
        rooms = await room_service.get_rooms(director_id)
        return rooms
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{room_id}", response_model=RoomResponse)
async def get_room_details(room_id: str):
    """Get complete room details"""
    try:
        room_details = await room_service.get_room_details(room_id)
        if not room_details:
            raise HTTPException(status_code=404, detail="Room not found")
        return room_details
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/code/{room_code}", response_model=Room)
async def get_room_by_code(room_code: str):
    """Get room by invite code"""
    try:
        room = await room_service.get_room_by_code(room_code)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        return room
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/join", response_model=Participant)
async def join_room(join_data: RoomJoin):
    """Join a room as participant"""
    try:
        participant = await room_service.join_room(
            join_data.room_code,
            join_data.participant_name
        )
        if not participant:
            raise HTTPException(status_code=404, detail="Room not found")
        
        # Auto-create routes for the new participant
        await routing_service.auto_route_participant(
            participant.room_id,
            participant.id
        )
        
        return participant
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{room_id}/participants/{participant_id}")
async def leave_room(room_id: str, participant_id: str):
    """Remove participant from room"""
    try:
        success = await room_service.leave_room(room_id, participant_id)
        if not success:
            raise HTTPException(status_code=404, detail="Participant not found in room")
        return {"message": "Participant removed from room"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{room_id}")
async def delete_room(room_id: str, director_id: str = "default_director"):
    """Delete a room"""
    try:
        success = await room_service.delete_room(room_id, director_id)
        if not success:
            raise HTTPException(status_code=404, detail="Room not found or access denied")
        return {"message": "Room deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{room_id}/participants", response_model=List[Participant])
async def get_room_participants(room_id: str):
    """Get all participants in a room"""
    try:
        room_details = await room_service.get_room_details(room_id)
        if not room_details:
            raise HTTPException(status_code=404, detail="Room not found")
        return room_details.participants
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))