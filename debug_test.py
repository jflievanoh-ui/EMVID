#!/usr/bin/env python3
import requests
import json

BACKEND_URL = 'https://sleek-vdo-booth.preview.emergentagent.com'
API_BASE = f"{BACKEND_URL}/api"

def test_basic_flow():
    session = requests.Session()
    test_data = {}
    
    print("=== Testing Basic Flow ===")
    
    # Test health
    response = session.get(f"{API_BASE}/")
    print(f"Health check: {response.status_code}")
    
    # Test room creation
    room_data = {
        "name": "Debug Test Room",
        "description": "Debug test room",
        "max_participants": 8
    }
    
    response = session.post(f"{API_BASE}/rooms", json=room_data, params={"director_id": "debug_director"})
    print(f"Room creation: {response.status_code}")
    if response.status_code == 200:
        room = response.json()
        test_data['room'] = room
        print(f"Room created: {room['name']} (ID: {room['id']})")
        print(f"Room data type: {type(room)}")
    else:
        print(f"Room creation failed: {response.text}")
        return
    
    # Test get rooms
    response = session.get(f"{API_BASE}/rooms", params={"director_id": "debug_director"})
    print(f"Get rooms: {response.status_code}")
    if response.status_code == 200:
        rooms = response.json()
        print(f"Retrieved {len(rooms)} rooms")
        print(f"Rooms data type: {type(rooms)}")
    
    # Test get room details
    if 'room' in test_data:
        room_id = test_data['room']['id']
        print(f"Testing room details for ID: {room_id}")
        response = session.get(f"{API_BASE}/rooms/{room_id}")
        print(f"Room details: {response.status_code}")
        if response.status_code == 200:
            room_details = response.json()
            print(f"Room details retrieved successfully")
            print(f"Participants: {len(room_details.get('participants', []))}")
        else:
            print(f"Room details failed: {response.text}")

if __name__ == "__main__":
    test_basic_flow()