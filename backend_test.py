#!/usr/bin/env python3
"""
Virtual Studio Backend API Test Suite

This test suite comprehensively tests all backend API endpoints for the Virtual Studio application.
It tests authentication, room management, audio/video management, routing, and session management.
"""

import requests
import json
import time
import os
from typing import Dict, Any, Optional

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://sleek-vdo-booth.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class VirtualStudioTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_data = {}
        self.results = []
        
    def log_result(self, test_name: str, success: bool, message: str = "", response_data: Any = None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        }
        self.results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"    {message}")
        if not success and response_data:
            print(f"    Response: {response_data}")
        print()

    def test_health_endpoints(self):
        """Test health check endpoints"""
        print("=== Testing Health Endpoints ===")
        
        # Test root endpoint
        try:
            response = self.session.get(f"{API_BASE}/")
            if response.status_code == 200:
                data = response.json()
                self.log_result("GET /api/", True, f"Root endpoint working: {data.get('message', '')}")
            else:
                self.log_result("GET /api/", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("GET /api/", False, f"Exception: {str(e)}")

        # Test health endpoint
        try:
            response = self.session.get(f"{API_BASE}/health")
            if response.status_code == 200:
                data = response.json()
                self.log_result("GET /api/health", True, f"Health check: {data.get('status', '')}")
            else:
                self.log_result("GET /api/health", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("GET /api/health", False, f"Exception: {str(e)}")

    def test_authentication(self):
        """Test authentication endpoints"""
        print("=== Testing Authentication ===")
        
        # Test user registration (director)
        director_data = {
            "name": "Studio Director",
            "email": "director@virtualstudio.com",
            "password": "director123",
            "role": "director"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=director_data)
            if response.status_code == 200:
                user_data = response.json()
                self.test_data['director'] = user_data
                self.log_result("POST /api/auth/register (director)", True, f"Director registered: {user_data['name']}")
            else:
                self.log_result("POST /api/auth/register (director)", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("POST /api/auth/register (director)", False, f"Exception: {str(e)}")

        # Test user registration (participant)
        participant_data = {
            "name": "Test Participant",
            "email": "participant@virtualstudio.com", 
            "password": "participant123",
            "role": "participant"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=participant_data)
            if response.status_code == 200:
                user_data = response.json()
                self.test_data['participant'] = user_data
                self.log_result("POST /api/auth/register (participant)", True, f"Participant registered: {user_data['name']}")
            else:
                self.log_result("POST /api/auth/register (participant)", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("POST /api/auth/register (participant)", False, f"Exception: {str(e)}")

        # Test user login
        login_data = {
            "name": "Studio Director",
            "email": "director@virtualstudio.com",
            "password": "director123"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            if response.status_code == 200:
                user_data = response.json()
                self.log_result("POST /api/auth/login", True, f"Login successful: {user_data['name']}")
            else:
                self.log_result("POST /api/auth/login", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("POST /api/auth/login", False, f"Exception: {str(e)}")

    def test_room_management(self):
        """Test room management endpoints"""
        print("=== Testing Room Management ===")
        
        # Test room creation
        room_data = {
            "name": "Virtual Studio Test Room",
            "description": "Test room for API testing",
            "max_participants": 8
        }
        
        try:
            response = self.session.post(f"{API_BASE}/rooms/", json=room_data, params={"director_id": "test_director"})
            if response.status_code == 200:
                room = response.json()
                self.test_data['room'] = room
                self.log_result("POST /api/rooms/", True, f"Room created: {room['name']} (Code: {room['invite_code']})")
            else:
                self.log_result("POST /api/rooms/", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("POST /api/rooms/", False, f"Exception: {str(e)}")

        # Test get rooms for director
        try:
            response = self.session.get(f"{API_BASE}/rooms/", params={"director_id": "test_director"})
            if response.status_code == 200:
                rooms = response.json()
                self.log_result("GET /api/rooms/", True, f"Retrieved {len(rooms)} rooms")
            else:
                self.log_result("GET /api/rooms/", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("GET /api/rooms/", False, f"Exception: {str(e)}")

        # Test get room details
        if 'room' in self.test_data:
            room_id = self.test_data['room']['id']
            try:
                response = self.session.get(f"{API_BASE}/rooms/{room_id}")
                if response.status_code == 200:
                    room_details = response.json()
                    self.log_result("GET /api/rooms/{room_id}", True, f"Room details retrieved with {len(room_details.get('participants', []))} participants")
                else:
                    self.log_result("GET /api/rooms/{room_id}", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result("GET /api/rooms/{room_id}", False, f"Exception: {str(e)}")

        # Test join room as participant
        if 'room' in self.test_data:
            join_data = {
                "participant_name": "Test Participant",
                "room_code": self.test_data['room']['invite_code']
            }
            
            try:
                response = self.session.post(f"{API_BASE}/rooms/join", json=join_data)
                if response.status_code == 200:
                    participant = response.json()
                    self.test_data['joined_participant'] = participant
                    self.log_result("POST /api/rooms/join", True, f"Participant joined: {participant['name']}")
                else:
                    self.log_result("POST /api/rooms/join", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result("POST /api/rooms/join", False, f"Exception: {str(e)}")

    def test_audio_management(self):
        """Test audio management endpoints"""
        print("=== Testing Audio Management ===")
        
        if 'room' not in self.test_data:
            self.log_result("Audio Management", False, "No room available for testing")
            return
            
        room_id = self.test_data['room']['id']
        
        # Test get audio sources
        try:
            response = self.session.get(f"{API_BASE}/audio/room/{room_id}")
            if response.status_code == 200:
                audio_sources = response.json()
                self.test_data['audio_sources'] = audio_sources
                self.log_result("GET /api/audio/room/{room_id}", True, f"Retrieved {len(audio_sources)} audio sources")
            else:
                self.log_result("GET /api/audio/room/{room_id}", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("GET /api/audio/room/{room_id}", False, f"Exception: {str(e)}")

        # Test audio source operations if we have sources
        if 'audio_sources' in self.test_data and self.test_data['audio_sources']:
            source_id = self.test_data['audio_sources'][0]['id']
            
            # Test toggle mute
            try:
                response = self.session.post(f"{API_BASE}/audio/{source_id}/toggle-mute")
                if response.status_code == 200:
                    source = response.json()
                    self.log_result("POST /api/audio/{source_id}/toggle-mute", True, f"Mute toggled: {source['is_muted']}")
                else:
                    self.log_result("POST /api/audio/{source_id}/toggle-mute", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result("POST /api/audio/{source_id}/toggle-mute", False, f"Exception: {str(e)}")

            # Test set volume
            try:
                volume_data = {"volume": 0.7}
                response = self.session.post(f"{API_BASE}/audio/{source_id}/volume", json=volume_data)
                if response.status_code == 200:
                    source = response.json()
                    self.log_result("POST /api/audio/{source_id}/volume", True, f"Volume set to: {source['volume']}")
                else:
                    self.log_result("POST /api/audio/{source_id}/volume", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result("POST /api/audio/{source_id}/volume", False, f"Exception: {str(e)}")



    def test_video_management(self):
        """Test video management endpoints"""
        print("=== Testing Video Management ===")
        
        if 'room' not in self.test_data:
            self.log_result("Video Management", False, "No room available for testing")
            return
            
        room_id = self.test_data['room']['id']
        
        # Test get video sources
        try:
            response = self.session.get(f"{API_BASE}/video/room/{room_id}")
            if response.status_code == 200:
                video_sources = response.json()
                self.test_data['video_sources'] = video_sources
                self.log_result("GET /api/video/room/{room_id}", True, f"Retrieved {len(video_sources)} video sources")
            else:
                self.log_result("GET /api/video/room/{room_id}", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("GET /api/video/room/{room_id}", False, f"Exception: {str(e)}")

        # Test video source operations if we have sources
        if 'video_sources' in self.test_data and self.test_data['video_sources']:
            source_id = self.test_data['video_sources'][0]['id']
            
            # Test toggle video
            try:
                response = self.session.post(f"{API_BASE}/video/{source_id}/toggle")
                if response.status_code == 200:
                    source = response.json()
                    self.log_result("POST /api/video/{source_id}/toggle", True, f"Video toggled: {source['is_enabled']}")
                else:
                    self.log_result("POST /api/video/{source_id}/toggle", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result("POST /api/video/{source_id}/toggle", False, f"Exception: {str(e)}")

            # Test set resolution
            try:
                resolution_data = {"resolution": "1280x720"}
                response = self.session.post(f"{API_BASE}/video/{source_id}/resolution", json=resolution_data)
                if response.status_code == 200:
                    source = response.json()
                    self.log_result("POST /api/video/{source_id}/resolution", True, f"Resolution set to: {source['resolution']}")
                else:
                    self.log_result("POST /api/video/{source_id}/resolution", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result("POST /api/video/{source_id}/resolution", False, f"Exception: {str(e)}")

            # Test get OBS URL
            try:
                response = self.session.get(f"{API_BASE}/video/{source_id}/obs-url")
                if response.status_code == 200:
                    obs_data = response.json()
                    self.log_result("GET /api/video/{source_id}/obs-url", True, f"OBS URL: {obs_data.get('obs_url', '')}")
                else:
                    self.log_result("GET /api/video/{source_id}/obs-url", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result("GET /api/video/{source_id}/obs-url", False, f"Exception: {str(e)}")

    def test_routing_management(self):
        """Test routing management endpoints"""
        print("=== Testing Routing Management ===")
        
        if 'room' not in self.test_data:
            self.log_result("Routing Management", False, "No room available for testing")
            return
            
        room_id = self.test_data['room']['id']
        
        # Test get routes
        try:
            response = self.session.get(f"{API_BASE}/routing/room/{room_id}")
            if response.status_code == 200:
                routes = response.json()
                self.test_data['routes'] = routes
                self.log_result("GET /api/routing/room/{room_id}", True, f"Retrieved {len(routes)} routes")
            else:
                self.log_result("GET /api/routing/room/{room_id}", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("GET /api/routing/room/{room_id}", False, f"Exception: {str(e)}")

        # Test get routing matrix
        try:
            response = self.session.get(f"{API_BASE}/routing/room/{room_id}/matrix")
            if response.status_code == 200:
                matrix = response.json()
                self.log_result("GET /api/routing/room/{room_id}/matrix", True, f"Matrix with {len(matrix.get('audio_sources', []))} audio, {len(matrix.get('video_sources', []))} video sources")
            else:
                self.log_result("GET /api/routing/room/{room_id}/matrix", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("GET /api/routing/room/{room_id}/matrix", False, f"Exception: {str(e)}")

        # Test create route if we have sources
        if ('audio_sources' in self.test_data and self.test_data['audio_sources'] and 
            'joined_participant' in self.test_data):
            
            source_id = self.test_data['audio_sources'][0]['id']
            participant_id = self.test_data['joined_participant']['id']
            
            route_data = {
                "room_id": room_id,
                "type": "audio",
                "source_id": source_id,
                "destinations": [participant_id, "obs_main"],
                "volume": 0.8
            }
            
            try:
                response = self.session.post(f"{API_BASE}/routing/", json=route_data)
                if response.status_code == 200:
                    route = response.json()
                    self.test_data['created_route'] = route
                    self.log_result("POST /api/routing/", True, f"Route created: {route['type']} from {route['source_id']}")
                else:
                    self.log_result("POST /api/routing/", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result("POST /api/routing/", False, f"Exception: {str(e)}")

    def test_session_management(self):
        """Test session management endpoints"""
        print("=== Testing Session Management ===")
        
        if 'room' not in self.test_data:
            self.log_result("Session Management", False, "No room available for testing")
            return
            
        room_id = self.test_data['room']['id']
        
        # Test get session
        try:
            response = self.session.get(f"{API_BASE}/sessions/{room_id}")
            if response.status_code == 200:
                session_data = response.json()
                self.log_result("GET /api/sessions/{room_id}", True, f"Session retrieved for room: {session_data['room']['name']}")
            else:
                self.log_result("GET /api/sessions/{room_id}", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("GET /api/sessions/{room_id}", False, f"Exception: {str(e)}")

        # Test toggle recording
        try:
            response = self.session.post(f"{API_BASE}/sessions/{room_id}/recording/toggle")
            if response.status_code == 200:
                session = response.json()
                self.log_result("POST /api/sessions/{room_id}/recording/toggle", True, f"Recording status: {session['is_recording']}")
            else:
                self.log_result("POST /api/sessions/{room_id}/recording/toggle", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("POST /api/sessions/{room_id}/recording/toggle", False, f"Exception: {str(e)}")

        # Test toggle streaming
        try:
            response = self.session.post(f"{API_BASE}/sessions/{room_id}/streaming/toggle")
            if response.status_code == 200:
                session = response.json()
                self.log_result("POST /api/sessions/{room_id}/streaming/toggle", True, f"Streaming status: {session['is_streaming']}")
            else:
                self.log_result("POST /api/sessions/{room_id}/streaming/toggle", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("POST /api/sessions/{room_id}/streaming/toggle", False, f"Exception: {str(e)}")

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        print("=== Testing Error Handling ===")
        
        # Test invalid room ID
        try:
            response = self.session.get(f"{API_BASE}/rooms/invalid-room-id")
            if response.status_code == 404:
                self.log_result("Error Handling - Invalid Room ID", True, "Correctly returned 404 for invalid room")
            else:
                self.log_result("Error Handling - Invalid Room ID", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_result("Error Handling - Invalid Room ID", False, f"Exception: {str(e)}")

        # Test invalid audio source
        try:
            response = self.session.post(f"{API_BASE}/audio/invalid-source-id/toggle-mute")
            if response.status_code == 404:
                self.log_result("Error Handling - Invalid Audio Source", True, "Correctly returned 404 for invalid audio source")
            else:
                self.log_result("Error Handling - Invalid Audio Source", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_result("Error Handling - Invalid Audio Source", False, f"Exception: {str(e)}")

        # Test invalid volume range
        try:
            volume_data = {"volume": 2.0}  # Invalid volume > 1.0
            response = self.session.post(f"{API_BASE}/audio/test-source/volume", json=volume_data)
            if response.status_code in [400, 404]:
                self.log_result("Error Handling - Invalid Volume", True, f"Correctly returned {response.status_code} for invalid volume")
            else:
                self.log_result("Error Handling - Invalid Volume", False, f"Expected 400/404, got {response.status_code}")
        except Exception as e:
            self.log_result("Error Handling - Invalid Volume", False, f"Exception: {str(e)}")

    def cleanup_test_data(self):
        """Clean up test data"""
        print("=== Cleaning Up Test Data ===")
        
        # Delete test room if created
        if 'room' in self.test_data:
            room_id = self.test_data['room']['id']
            try:
                response = self.session.delete(f"{API_BASE}/rooms/{room_id}", params={"director_id": "test_director"})
                if response.status_code == 200:
                    self.log_result("Cleanup - Delete Room", True, "Test room deleted successfully")
                else:
                    self.log_result("Cleanup - Delete Room", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_result("Cleanup - Delete Room", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Virtual Studio Backend API Tests")
        print(f"Testing against: {API_BASE}")
        print("=" * 60)
        
        # Run all test suites
        self.test_health_endpoints()
        self.test_authentication()
        self.test_room_management()
        self.test_audio_management()
        self.test_video_management()
        self.test_routing_management()
        self.test_session_management()
        self.test_error_handling()
        self.cleanup_test_data()
        
        # Print summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.results)
        passed_tests = len([r for r in self.results if r['success']])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n🎯 Test completed!")
        return passed_tests, failed_tests

def main():
    """Main test execution"""
    tester = VirtualStudioTester()
    passed, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()