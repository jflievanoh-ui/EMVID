from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import AudioSource, AudioSourceUpdate
from database import get_database


class AudioService:
    def __init__(self):
        self.db: Optional[AsyncIOMotorDatabase] = None

    async def get_db(self):
        if not self.db:
            self.db = await get_database()
        return self.db

    async def get_audio_sources(self, room_id: str) -> List[AudioSource]:
        """Get all audio sources for a room"""
        db = await self.get_db()
        sources_cursor = db.audio_sources.find({"room_id": room_id})
        sources = []
        async for source_doc in sources_cursor:
            sources.append(AudioSource(**source_doc))
        return sources

    async def get_audio_source(self, source_id: str) -> Optional[AudioSource]:
        """Get a specific audio source"""
        db = await self.get_db()
        source_doc = await db.audio_sources.find_one({"id": source_id})
        return AudioSource(**source_doc) if source_doc else None

    async def update_audio_source(self, source_id: str, update_data: AudioSourceUpdate) -> Optional[AudioSource]:
        """Update audio source settings"""
        db = await self.get_db()
        
        # Build update dict, excluding None values
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        
        if not update_dict:
            return await self.get_audio_source(source_id)

        await db.audio_sources.update_one(
            {"id": source_id},
            {"$set": update_dict}
        )
        
        return await self.get_audio_source(source_id)

    async def toggle_mute(self, source_id: str) -> Optional[AudioSource]:
        """Toggle mute status of an audio source"""
        source = await self.get_audio_source(source_id)
        if not source:
            return None
        
        return await self.update_audio_source(
            source_id, 
            AudioSourceUpdate(is_muted=not source.is_muted)
        )

    async def set_volume(self, source_id: str, volume: float) -> Optional[AudioSource]:
        """Set volume of an audio source"""
        # Clamp volume between 0 and 1
        volume = max(0.0, min(1.0, volume))
        
        return await self.update_audio_source(
            source_id,
            AudioSourceUpdate(volume=volume)
        )

    async def set_gain(self, source_id: str, gain: float) -> Optional[AudioSource]:
        """Set gain of an audio source"""
        # Clamp gain between 0 and 1
        gain = max(0.0, min(1.0, gain))
        
        return await self.update_audio_source(
            source_id,
            AudioSourceUpdate(gain=gain)
        )

    async def toggle_processing(self, source_id: str, processing_type: str) -> Optional[AudioSource]:
        """Toggle audio processing (lowcut, compressor, gate)"""
        source = await self.get_audio_source(source_id)
        if not source:
            return None

        current_value = getattr(source, processing_type, False)
        
        update_data = AudioSourceUpdate()
        setattr(update_data, processing_type, not current_value)
        
        return await self.update_audio_source(source_id, update_data)


# Global audio service instance
audio_service = AudioService()