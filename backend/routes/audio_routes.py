from fastapi import APIRouter, HTTPException
from typing import List
from models import AudioSource, AudioSourceUpdate
from services.audio_service import audio_service

router = APIRouter()

@router.get("/room/{room_id}", response_model=List[AudioSource])
async def get_audio_sources(room_id: str):
    """Get all audio sources for a room"""
    try:
        sources = await audio_service.get_audio_sources(room_id)
        return sources
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{source_id}", response_model=AudioSource)
async def get_audio_source(source_id: str):
    """Get specific audio source"""
    try:
        source = await audio_service.get_audio_source(source_id)
        if not source:
            raise HTTPException(status_code=404, detail="Audio source not found")
        return source
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{source_id}", response_model=AudioSource)
async def update_audio_source(source_id: str, update_data: AudioSourceUpdate):
    """Update audio source settings"""
    try:
        source = await audio_service.update_audio_source(source_id, update_data)
        if not source:
            raise HTTPException(status_code=404, detail="Audio source not found")
        return source
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{source_id}/toggle-mute", response_model=AudioSource)
async def toggle_mute(source_id: str):
    """Toggle mute status of audio source"""
    try:
        source = await audio_service.toggle_mute(source_id)
        if not source:
            raise HTTPException(status_code=404, detail="Audio source not found")
        return source
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{source_id}/volume", response_model=AudioSource)
async def set_volume(source_id: str, volume_data: dict):
    """Set volume of audio source"""
    try:
        volume = volume_data.get("volume", 0.8)
        if not 0.0 <= volume <= 1.0:
            raise HTTPException(status_code=400, detail="Volume must be between 0 and 1")
        
        source = await audio_service.set_volume(source_id, volume)
        if not source:
            raise HTTPException(status_code=404, detail="Audio source not found")
        return source
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{source_id}/gain", response_model=AudioSource)
async def set_gain(source_id: str, gain_data: dict):
    """Set gain of audio source"""
    try:
        gain = gain_data.get("gain", 0.6)
        if not 0.0 <= gain <= 1.0:
            raise HTTPException(status_code=400, detail="Gain must be between 0 and 1")
        
        source = await audio_service.set_gain(source_id, gain)
        if not source:
            raise HTTPException(status_code=404, detail="Audio source not found")
        return source
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{source_id}/processing/{processing_type}", response_model=AudioSource)
async def toggle_processing(source_id: str, processing_type: str):
    """Toggle audio processing (lowcut, compressor, gate)"""
    try:
        valid_types = ["lowcut", "compressor", "gate"]
        if processing_type not in valid_types:
            raise HTTPException(status_code=400, detail=f"Invalid processing type. Must be one of: {valid_types}")
        
        source = await audio_service.toggle_processing(source_id, processing_type)
        if not source:
            raise HTTPException(status_code=404, detail="Audio source not found")
        return source
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))