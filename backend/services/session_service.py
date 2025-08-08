from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import Session, SessionUpdate, SessionResponse, Room, Participant
from database import get_database
from datetime import datetime


class SessionService:
    def __init__(self):
        self.db: Optional[AsyncIOMotorDatabase] = None

    async def get_db(self):
        if not self.db:
            self.db = await get_database()
        return self.db

    async def get_session(self, room_id: str) -> Optional[Session]:
        """Get session for a room"""
        db = await self.get_db()
        session_doc = await db.sessions.find_one({"room_id": room_id})
        return Session(**session_doc) if session_doc else None

    async def create_session(self, room_id: str) -> Session:
        """Create a new session for a room"""
        db = await self.get_db()
        
        # Check if session already exists
        existing_session = await self.get_session(room_id)
        if existing_session:
            return existing_session

        session = Session(room_id=room_id)
        await db.sessions.insert_one(session.dict())
        
        return session

    async def update_session(self, room_id: str, update_data: SessionUpdate) -> Optional[Session]:
        """Update session settings"""
        db = await self.get_db()
        
        session = await self.get_session(room_id)
        if not session:
            # Create session if it doesn't exist
            session = await self.create_session(room_id)

        # Build update dict, excluding None values
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        
        # Add timestamps for recording/streaming state changes
        if "is_recording" in update_dict:
            if update_dict["is_recording"]:
                update_dict["recording_start_time"] = datetime.utcnow()
            else:
                update_dict["recording_start_time"] = None

        if "is_streaming" in update_dict:
            if update_dict["is_streaming"]:
                update_dict["streaming_start_time"] = datetime.utcnow()
            else:
                update_dict["streaming_start_time"] = None

        if update_dict:
            await db.sessions.update_one(
                {"room_id": room_id},
                {"$set": update_dict}
            )

        return await self.get_session(room_id)

    async def start_recording(self, room_id: str) -> Optional[Session]:
        """Start recording for a session"""
        return await self.update_session(
            room_id,
            SessionUpdate(is_recording=True)
        )

    async def stop_recording(self, room_id: str) -> Optional[Session]:
        """Stop recording for a session"""
        return await self.update_session(
            room_id,
            SessionUpdate(is_recording=False)
        )

    async def start_streaming(self, room_id: str) -> Optional[Session]:
        """Start streaming for a session"""
        return await self.update_session(
            room_id,
            SessionUpdate(is_streaming=True)
        )

    async def stop_streaming(self, room_id: str) -> Optional[Session]:
        """Stop streaming for a session"""
        return await self.update_session(
            room_id,
            SessionUpdate(is_streaming=False)
        )

    async def toggle_recording(self, room_id: str) -> Optional[Session]:
        """Toggle recording status"""
        session = await self.get_session(room_id)
        if not session:
            session = await self.create_session(room_id)
        
        return await self.update_session(
            room_id,
            SessionUpdate(is_recording=not session.is_recording)
        )

    async def toggle_streaming(self, room_id: str) -> Optional[Session]:
        """Toggle streaming status"""
        session = await self.get_session(room_id)
        if not session:
            session = await self.create_session(room_id)
        
        return await self.update_session(
            room_id,
            SessionUpdate(is_streaming=not session.is_streaming)
        )

    async def get_session_details(self, room_id: str) -> Optional[SessionResponse]:
        """Get complete session details with room and participants"""
        db = await self.get_db()
        
        session = await self.get_session(room_id)
        if not session:
            session = await self.create_session(room_id)

        # Get room details
        room_doc = await db.rooms.find_one({"id": room_id})
        if not room_doc:
            return None
        room = Room(**room_doc)

        # Get participants
        participants_cursor = db.participants.find({"room_id": room_id})
        participants = []
        async for participant_doc in participants_cursor:
            participants.append(Participant(**participant_doc))

        return SessionResponse(
            session=session,
            room=room,
            participants=participants
        )

    async def get_recording_duration(self, room_id: str) -> Optional[int]:
        """Get recording duration in seconds"""
        session = await self.get_session(room_id)
        if not session or not session.is_recording or not session.recording_start_time:
            return None
        
        duration = datetime.utcnow() - session.recording_start_time
        return int(duration.total_seconds())

    async def get_streaming_duration(self, room_id: str) -> Optional[int]:
        """Get streaming duration in seconds"""
        session = await self.get_session(room_id)
        if not session or not session.is_streaming or not session.streaming_start_time:
            return None
        
        duration = datetime.utcnow() - session.streaming_start_time
        return int(duration.total_seconds())


# Global session service instance
session_service = SessionService()