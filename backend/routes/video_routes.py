from fastapi import APIRouter, HTTPException
from typing import List, Dict
from models import VideoSource, VideoSourceUpdate
from services.video_service import video_service

router = APIRouter()

@router.get("/room/{room_id}", response_model=List[VideoSource])
async def get_video_sources(room_id: str):
    """Get all video sources for a room"""
    try:
        sources = await video_service.get_video_sources(room_id)
        return sources
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{source_id}", response_model=VideoSource)
async def get_video_source(source_id: str):
    """Get specific video source"""
    try:
        source = await video_service.get_video_source(source_id)
        if not source:
            raise HTTPException(status_code=404, detail="Video source not found")
        return source
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{source_id}", response_model=VideoSource)
async def update_video_source(source_id: str, update_data: VideoSourceUpdate):
    """Update video source settings"""
    try:
        source = await video_service.update_video_source(source_id, update_data)
        if not source:
            raise HTTPException(status_code=404, detail="Video source not found")
        return source
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{source_id}/toggle", response_model=VideoSource)
async def toggle_video_source(source_id: str):
    """Toggle enable status of video source"""
    try:
        source = await video_service.toggle_enable(source_id)
        if not source:
            raise HTTPException(status_code=404, detail="Video source not found")
        return source
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{source_id}/resolution", response_model=VideoSource)
async def set_resolution(source_id: str, resolution_data: dict):
    """Set resolution of video source"""
    try:
        resolution = resolution_data.get("resolution")
        if not resolution:
            raise HTTPException(status_code=400, detail="Resolution is required")
        
        source = await video_service.set_resolution(source_id, resolution)
        if not source:
            raise HTTPException(status_code=404, detail="Video source not found")
        return source
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{source_id}/framerate", response_model=VideoSource)
async def set_framerate(source_id: str, fps_data: dict):
    """Set frame rate of video source"""
    try:
        fps = fps_data.get("fps")
        if not fps:
            raise HTTPException(status_code=400, detail="FPS is required")
        
        source = await video_service.set_framerate(source_id, fps)
        if not source:
            raise HTTPException(status_code=404, detail="Video source not found")
        return source
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{source_id}/obs-url")
async def get_obs_url(source_id: str, base_url: str = "http://localhost:3000"):
    """Get OBS browser source URL for video source"""
    try:
        obs_url = await video_service.get_obs_url(source_id, base_url)
        if not obs_url:
            raise HTTPException(status_code=404, detail="Video source not found")
        return {"obs_url": obs_url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/room/{room_id}/obs-urls", response_model=Dict)
async def get_all_obs_urls(room_id: str, base_url: str = "http://localhost:3000"):
    """Get all OBS URLs for video sources in a room"""
    try:
        obs_urls = await video_service.get_all_obs_urls(room_id, base_url)
        return obs_urls
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))