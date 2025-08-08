from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import VideoSource, VideoSourceUpdate
from database import get_database


class VideoService:
    def __init__(self):
        self.db: Optional[AsyncIOMotorDatabase] = None

    async def get_db(self):
        if not self.db:
            self.db = await get_database()
        return self.db

    async def get_video_sources(self, room_id: str) -> List[VideoSource]:
        """Get all video sources for a room"""
        db = await self.get_db()
        sources_cursor = db.video_sources.find({"room_id": room_id})
        sources = []
        async for source_doc in sources_cursor:
            sources.append(VideoSource(**source_doc))
        return sources

    async def get_video_source(self, source_id: str) -> Optional[VideoSource]:
        """Get a specific video source"""
        db = await self.get_db()
        source_doc = await db.video_sources.find_one({"id": source_id})
        return VideoSource(**source_doc) if source_doc else None

    async def update_video_source(self, source_id: str, update_data: VideoSourceUpdate) -> Optional[VideoSource]:
        """Update video source settings"""
        db = await self.get_db()
        
        # Build update dict, excluding None values
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        
        if not update_dict:
            return await self.get_video_source(source_id)

        await db.video_sources.update_one(
            {"id": source_id},
            {"$set": update_dict}
        )
        
        return await self.get_video_source(source_id)

    async def toggle_enable(self, source_id: str) -> Optional[VideoSource]:
        """Toggle enable status of a video source"""
        source = await self.get_video_source(source_id)
        if not source:
            return None
        
        return await self.update_video_source(
            source_id,
            VideoSourceUpdate(is_enabled=not source.is_enabled)
        )

    async def set_resolution(self, source_id: str, resolution: str) -> Optional[VideoSource]:
        """Set resolution of a video source"""
        valid_resolutions = ["640x480", "1280x720", "1920x1080", "2560x1440", "3840x2160"]
        
        if resolution not in valid_resolutions:
            raise ValueError(f"Invalid resolution. Must be one of: {valid_resolutions}")
        
        return await self.update_video_source(
            source_id,
            VideoSourceUpdate(resolution=resolution)
        )

    async def set_framerate(self, source_id: str, fps: int) -> Optional[VideoSource]:
        """Set frame rate of a video source"""
        valid_fps = [15, 24, 30, 60]
        
        if fps not in valid_fps:
            raise ValueError(f"Invalid frame rate. Must be one of: {valid_fps}")
        
        return await self.update_video_source(
            source_id,
            VideoSourceUpdate(fps=fps)
        )

    async def get_obs_url(self, source_id: str, base_url: str = "http://localhost:3000") -> Optional[str]:
        """Generate OBS browser source URL for a video source"""
        source = await self.get_video_source(source_id)
        if not source:
            return None
        
        # Generate OBS-compatible URL
        obs_url = f"{base_url}/obs/video/{source_id}"
        return obs_url

    async def get_all_obs_urls(self, room_id: str, base_url: str = "http://localhost:3000") -> dict:
        """Get all OBS URLs for video sources in a room"""
        sources = await self.get_video_sources(room_id)
        obs_urls = {}
        
        for source in sources:
            if source.is_enabled:
                obs_urls[source.id] = {
                    "name": source.name,
                    "url": f"{base_url}/obs/video/{source.id}",
                    "resolution": source.resolution,
                    "fps": source.fps
                }
        
        return obs_urls


# Global video service instance
video_service = VideoService()