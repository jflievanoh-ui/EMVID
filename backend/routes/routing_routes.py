from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from models import Route, RouteCreate, RouteUpdate
from services.routing_service import routing_service

router = APIRouter()

@router.post("/", response_model=Route)
async def create_route(route_data: RouteCreate):
    """Create a new audio/video route"""
    try:
        route = await routing_service.create_route(route_data)
        return route
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/room/{room_id}", response_model=List[Route])
async def get_routes(room_id: str):
    """Get all routes for a room"""
    try:
        routes = await routing_service.get_routes(room_id)
        return routes
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{route_id}", response_model=Route)
async def get_route(route_id: str):
    """Get specific route"""
    try:
        route = await routing_service.get_route(route_id)
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
        return route
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{route_id}", response_model=Route)
async def update_route(route_id: str, update_data: RouteUpdate):
    """Update route settings"""
    try:
        route = await routing_service.update_route(route_id, update_data)
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
        return route
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{route_id}")
async def delete_route(route_id: str):
    """Delete a route"""
    try:
        success = await routing_service.delete_route(route_id)
        if not success:
            raise HTTPException(status_code=404, detail="Route not found")
        return {"message": "Route deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{route_id}/toggle", response_model=Route)
async def toggle_route(route_id: str):
    """Toggle route active status"""
    try:
        route = await routing_service.toggle_route(route_id)
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
        return route
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{route_id}/volume", response_model=Route)
async def update_route_volume(route_id: str, volume_data: dict):
    """Update audio route volume"""
    try:
        volume = volume_data.get("volume", 0.8)
        if not 0.0 <= volume <= 1.0:
            raise HTTPException(status_code=400, detail="Volume must be between 0 and 1")
        
        route = await routing_service.update_route_volume(route_id, volume)
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
        return route
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{route_id}/destinations/{destination_id}", response_model=Route)
async def add_destination(route_id: str, destination_id: str):
    """Add destination to route"""
    try:
        route = await routing_service.add_destination(route_id, destination_id)
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
        return route
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{route_id}/destinations/{destination_id}", response_model=Route)
async def remove_destination(route_id: str, destination_id: str):
    """Remove destination from route"""
    try:
        route = await routing_service.remove_destination(route_id, destination_id)
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
        return route
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/room/{room_id}/matrix", response_model=Dict[str, Any])
async def get_routing_matrix(room_id: str):
    """Get complete routing matrix for a room"""
    try:
        matrix = await routing_service.get_routing_matrix(room_id)
        return matrix
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/room/{room_id}/participant/{participant_id}/auto-route", response_model=List[Route])
async def auto_route_participant(room_id: str, participant_id: str):
    """Automatically create routes for a participant"""
    try:
        routes = await routing_service.auto_route_participant(room_id, participant_id)
        return routes
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))