from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import Route, RouteCreate, RouteUpdate, AudioSource, VideoSource
from database import get_database


class RoutingService:
    def __init__(self):
        self.db: Optional[AsyncIOMotorDatabase] = None

    async def get_db(self):
        if not self.db:
            self.db = await get_database()
        return self.db

    async def create_route(self, route_data: RouteCreate) -> Route:
        """Create a new audio/video route"""
        db = await self.get_db()
        
        # Validate source exists
        if route_data.type == "audio":
            source = await db.audio_sources.find_one({"id": route_data.source_id})
        else:
            source = await db.video_sources.find_one({"id": route_data.source_id})
        
        if not source:
            raise ValueError(f"Source {route_data.source_id} not found")

        route = Route(**route_data.dict())
        await db.routes.insert_one(route.dict())
        
        return route

    async def get_routes(self, room_id: str) -> List[Route]:
        """Get all routes for a room"""
        db = await self.get_db()
        routes_cursor = db.routes.find({"room_id": room_id})
        routes = []
        async for route_doc in routes_cursor:
            routes.append(Route(**route_doc))
        return routes

    async def get_route(self, route_id: str) -> Optional[Route]:
        """Get a specific route"""
        db = await self.get_db()
        route_doc = await db.routes.find_one({"id": route_id})
        return Route(**route_doc) if route_doc else None

    async def update_route(self, route_id: str, update_data: RouteUpdate) -> Optional[Route]:
        """Update route settings"""
        db = await self.get_db()
        
        # Build update dict, excluding None values
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        
        if not update_dict:
            return await self.get_route(route_id)

        await db.routes.update_one(
            {"id": route_id},
            {"$set": update_dict}
        )
        
        return await self.get_route(route_id)

    async def delete_route(self, route_id: str) -> bool:
        """Delete a route"""
        db = await self.get_db()
        result = await db.routes.delete_one({"id": route_id})
        return result.deleted_count > 0

    async def toggle_route(self, route_id: str) -> Optional[Route]:
        """Toggle route active status"""
        route = await self.get_route(route_id)
        if not route:
            return None
        
        return await self.update_route(
            route_id,
            RouteUpdate(is_active=not route.is_active)
        )

    async def update_route_volume(self, route_id: str, volume: float) -> Optional[Route]:
        """Update audio route volume"""
        # Clamp volume between 0 and 1
        volume = max(0.0, min(1.0, volume))
        
        return await self.update_route(
            route_id,
            RouteUpdate(volume=volume)
        )

    async def add_destination(self, route_id: str, destination_id: str) -> Optional[Route]:
        """Add destination to a route"""
        route = await self.get_route(route_id)
        if not route:
            return None
        
        if destination_id not in route.destinations:
            new_destinations = route.destinations + [destination_id]
            return await self.update_route(
                route_id,
                RouteUpdate(destinations=new_destinations)
            )
        
        return route

    async def remove_destination(self, route_id: str, destination_id: str) -> Optional[Route]:
        """Remove destination from a route"""
        route = await self.get_route(route_id)
        if not route:
            return None
        
        if destination_id in route.destinations:
            new_destinations = [d for d in route.destinations if d != destination_id]
            return await self.update_route(
                route_id,
                RouteUpdate(destinations=new_destinations)
            )
        
        return route

    async def get_routing_matrix(self, room_id: str) -> Dict[str, Any]:
        """Get complete routing matrix for a room"""
        db = await self.get_db()
        
        # Get all sources
        audio_sources = []
        audio_cursor = db.audio_sources.find({"room_id": room_id})
        async for source_doc in audio_cursor:
            audio_sources.append(AudioSource(**source_doc))

        video_sources = []
        video_cursor = db.video_sources.find({"room_id": room_id})
        async for source_doc in video_cursor:
            video_sources.append(VideoSource(**source_doc))

        # Get all routes
        routes = await self.get_routes(room_id)

        # Get participants for destination info
        participants = []
        participants_cursor = db.participants.find({"room_id": room_id})
        async for participant_doc in participants_cursor:
            participants.append({
                "id": participant_doc["id"],
                "name": participant_doc["name"]
            })

        # Build routing matrix
        matrix = {
            "audio_sources": [source.dict() for source in audio_sources],
            "video_sources": [source.dict() for source in video_sources],
            "routes": [route.dict() for route in routes],
            "participants": participants,
            "obs_outputs": [
                {"id": "obs_main", "name": "OBS Main Mix", "type": "obs"},
                {"id": "obs_camera1", "name": "OBS Camera 1", "type": "obs"},
                {"id": "obs_camera2", "name": "OBS Camera 2", "type": "obs"},
                {"id": "obs_audio1", "name": "OBS Audio 1", "type": "obs"},
                {"id": "obs_audio2", "name": "OBS Audio 2", "type": "obs"}
            ]
        }
        
        return matrix

    async def auto_route_participant(self, room_id: str, participant_id: str) -> List[Route]:
        """Automatically create routes for a new participant"""
        db = await self.get_db()
        
        # Get participant's sources
        audio_sources = await db.audio_sources.find({"participant_id": participant_id}).to_list(None)
        video_sources = await db.video_sources.find({"participant_id": participant_id}).to_list(None)
        
        # Get other participants for destinations
        other_participants = []
        participants_cursor = db.participants.find({
            "room_id": room_id,
            "id": {"$ne": participant_id}
        })
        async for participant_doc in participants_cursor:
            other_participants.append(participant_doc["id"])

        created_routes = []

        # Create audio routes
        for audio_source in audio_sources:
            destinations = other_participants + ["obs_main"]
            route_data = RouteCreate(
                room_id=room_id,
                type="audio",
                source_id=audio_source["id"],
                destinations=destinations,
                volume=0.8
            )
            route = await self.create_route(route_data)
            created_routes.append(route)

        # Create video routes
        for video_source in video_sources:
            destinations = other_participants + ["obs_camera1"]
            route_data = RouteCreate(
                room_id=room_id,
                type="video",
                source_id=video_source["id"],
                destinations=destinations,
                quality="1080p"
            )
            route = await self.create_route(route_data)
            created_routes.append(route)

        return created_routes


# Global routing service instance
routing_service = RoutingService()