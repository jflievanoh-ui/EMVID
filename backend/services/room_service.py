from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import Room, RoomCreate, Participant, AudioSource, VideoSource, Route, RoomResponse, SourceType
from database import get_database
import uuid
from datetime import datetime


class RoomService:
    def __init__(self):
        self.db: Optional[AsyncIOMotorDatabase] = None

    async def get_db(self):
        if not self.db:
            self.db = await get_database()
        return self.db

    async def create_room(self, room_data: RoomCreate, director_id: str) -> Room:
        """Create a new virtual studio room"""
        db = await self.get_db()
        
        # Generate unique invite code
        invite_code = self._generate_invite_code()
        while await db.rooms.find_one({"invite_code": invite_code}):
            invite_code = self._generate_invite_code()
        
        room = Room(
            name=room_data.name,
            description=room_data.description,
            max_participants=room_data.max_participants,
            invite_code=invite_code,
            director_id=director_id
        )
        
        await db.rooms.insert_one(room.dict())
        
        # Initialize room with basic audio/video sources
        await self._initialize_room_sources(room.id)
        
        return room

    async def get_room(self, room_id: str) -> Optional[Room]:
        """Get room by ID"""
        db = await self.get_db()
        room_doc = await db.rooms.find_one({"id": room_id})
        return Room(**room_doc) if room_doc else None

    async def get_room_by_code(self, invite_code: str) -> Optional[Room]:
        """Get room by invite code"""
        db = await self.get_db()
        room_doc = await db.rooms.find_one({"invite_code": invite_code.upper()})
        return Room(**room_doc) if room_doc else None

    async def get_rooms(self, director_id: str) -> List[Room]:
        """Get all rooms for a director"""
        db = await self.get_db()
        rooms_cursor = db.rooms.find({"director_id": director_id})
        rooms = []
        async for room_doc in rooms_cursor:
            rooms.append(Room(**room_doc))
        return rooms

    async def get_room_details(self, room_id: str) -> Optional[RoomResponse]:
        """Get complete room details with participants, sources, and routes"""
        db = await self.get_db()
        
        room = await self.get_room(room_id)
        if not room:
            return None

        # Get participants
        participants_cursor = db.participants.find({"room_id": room_id})
        participants = []
        async for participant_doc in participants_cursor:
            participants.append(Participant(**participant_doc))

        # Get audio sources
        audio_cursor = db.audio_sources.find({"room_id": room_id})
        audio_sources = []
        async for audio_doc in audio_cursor:
            audio_sources.append(AudioSource(**audio_doc))

        # Get video sources
        video_cursor = db.video_sources.find({"room_id": room_id})
        video_sources = []
        async for video_doc in video_cursor:
            video_sources.append(VideoSource(**video_doc))

        # Get routes
        routes_cursor = db.routes.find({"room_id": room_id})
        routes = []
        async for route_doc in routes_cursor:
            routes.append(Route(**route_doc))

        return RoomResponse(
            room=room,
            participants=participants,
            audio_sources=audio_sources,
            video_sources=video_sources,
            routes=routes
        )

    async def join_room(self, room_code: str, participant_name: str) -> Optional[Participant]:
        """Add a participant to a room"""
        db = await self.get_db()
        
        room = await self.get_room_by_code(room_code)
        if not room:
            return None

        # Check if room is full
        participant_count = await db.participants.count_documents({"room_id": room.id})
        if participant_count >= room.max_participants:
            raise ValueError("Room is full")

        # Create participant
        participant = Participant(
            name=participant_name,
            room_id=room.id,
            avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={participant_name}"
        )

        await db.participants.insert_one(participant.dict())

        # Update room participants list
        await db.rooms.update_one(
            {"id": room.id},
            {"$addToSet": {"participants": participant.id}}
        )

        # Create audio and video sources for the participant
        await self._create_participant_sources(room.id, participant.id, participant_name)

        return participant

    async def leave_room(self, room_id: str, participant_id: str) -> bool:
        """Remove a participant from a room"""
        db = await self.get_db()

        # Remove participant
        result = await db.participants.delete_one({
            "id": participant_id,
            "room_id": room_id
        })

        if result.deleted_count == 0:
            return False

        # Update room participants list
        await db.rooms.update_one(
            {"id": room_id},
            {"$pull": {"participants": participant_id}}
        )

        # Remove participant's sources
        await db.audio_sources.delete_many({"participant_id": participant_id})
        await db.video_sources.delete_many({"participant_id": participant_id})

        # Remove routes involving this participant
        await db.routes.delete_many({
            "$or": [
                {"source_id": {"$in": await self._get_participant_source_ids(participant_id)}},
                {"destinations": participant_id}
            ]
        })

        return True

    async def delete_room(self, room_id: str, director_id: str) -> bool:
        """Delete a room and all associated data"""
        db = await self.get_db()

        # Verify ownership
        room = await db.rooms.find_one({"id": room_id, "director_id": director_id})
        if not room:
            return False

        # Delete all associated data
        await db.participants.delete_many({"room_id": room_id})
        await db.audio_sources.delete_many({"room_id": room_id})
        await db.video_sources.delete_many({"room_id": room_id})
        await db.routes.delete_many({"room_id": room_id})
        await db.sessions.delete_many({"room_id": room_id})
        await db.signaling.delete_many({"room_id": room_id})

        # Delete the room
        await db.rooms.delete_one({"id": room_id})
        
        return True

    def _generate_invite_code(self) -> str:
        """Generate a random 6-character invite code"""
        import random
        import string
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

    async def _initialize_room_sources(self, room_id: str):
        """Initialize basic audio/video sources for a new room"""
        db = await self.get_db()
        
        # Create background music source
        background_music = AudioSource(
            name="Background Music",
            type=SourceType.MUSIC,
            room_id=room_id,
            is_enabled=False,
            is_muted=True,
            volume=0.3
        )
        await db.audio_sources.insert_one(background_music.dict())

    async def _create_participant_sources(self, room_id: str, participant_id: str, participant_name: str):
        """Create audio and video sources for a participant"""
        db = await self.get_db()

        # Create microphone source
        microphone = AudioSource(
            name=f"{participant_name} - Microphone",
            type=SourceType.MICROPHONE,
            participant_id=participant_id,
            room_id=room_id
        )
        await db.audio_sources.insert_one(microphone.dict())

        # Create camera source
        camera = VideoSource(
            name=f"{participant_name} - Camera",
            type=SourceType.CAMERA,
            participant_id=participant_id,
            room_id=room_id
        )
        await db.video_sources.insert_one(camera.dict())

    async def _get_participant_source_ids(self, participant_id: str) -> List[str]:
        """Get all source IDs for a participant"""
        db = await self.get_db()
        
        source_ids = []
        
        # Get audio source IDs
        audio_cursor = db.audio_sources.find({"participant_id": participant_id})
        async for audio_doc in audio_cursor:
            source_ids.append(audio_doc["id"])

        # Get video source IDs
        video_cursor = db.video_sources.find({"participant_id": participant_id})
        async for video_doc in video_cursor:
            source_ids.append(video_doc["id"])

        return source_ids


# Global room service instance
room_service = RoomService()