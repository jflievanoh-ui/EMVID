from fastapi import APIRouter, HTTPException
from models import Session, SessionUpdate, SessionResponse
from services.session_service import session_service

router = APIRouter()

@router.get("/{room_id}", response_model=SessionResponse)
async def get_session(room_id: str):
    """Get session details for a room"""
    try:
        session_details = await session_service.get_session_details(room_id)
        if not session_details:
            raise HTTPException(status_code=404, detail="Room not found")
        return session_details
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{room_id}", response_model=Session)
async def update_session(room_id: str, update_data: SessionUpdate):
    """Update session settings"""
    try:
        session = await session_service.update_session(room_id, update_data)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{room_id}/recording/start", response_model=Session)
async def start_recording(room_id: str):
    """Start recording for a session"""
    try:
        session = await session_service.start_recording(room_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{room_id}/recording/stop", response_model=Session)
async def stop_recording(room_id: str):
    """Stop recording for a session"""
    try:
        session = await session_service.stop_recording(room_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{room_id}/recording/toggle", response_model=Session)
async def toggle_recording(room_id: str):
    """Toggle recording status"""
    try:
        session = await session_service.toggle_recording(room_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{room_id}/streaming/start", response_model=Session)
async def start_streaming(room_id: str):
    """Start streaming for a session"""
    try:
        session = await session_service.start_streaming(room_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{room_id}/streaming/stop", response_model=Session)
async def stop_streaming(room_id: str):
    """Stop streaming for a session"""
    try:
        session = await session_service.stop_streaming(room_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{room_id}/streaming/toggle", response_model=Session)
async def toggle_streaming(room_id: str):
    """Toggle streaming status"""
    try:
        session = await session_service.toggle_streaming(room_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{room_id}/recording/duration")
async def get_recording_duration(room_id: str):
    """Get recording duration in seconds"""
    try:
        duration = await session_service.get_recording_duration(room_id)
        return {"duration_seconds": duration}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{room_id}/streaming/duration")
async def get_streaming_duration(room_id: str):
    """Get streaming duration in seconds"""
    try:
        duration = await session_service.get_streaming_duration(room_id)
        return {"duration_seconds": duration}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))