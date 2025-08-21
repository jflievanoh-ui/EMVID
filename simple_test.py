#!/usr/bin/env python3
import requests
import json

BACKEND_URL = 'https://sleek-vdo-booth.preview.emergentagent.com'
API_BASE = f"{BACKEND_URL}/api"

class SimpleVirtualStudioTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_data = {}
        self.results = []
        
    def log_result(self, test_name: str, success: bool, message: str = "", response_data = None):
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

    def test_room_management(self):
        """Test room management endpoints"""
        print("=== Testing Room Management ===")
        
        # Test room creation
        room_data = {
            "name": "Simple Test Room",
            "description": "Simple test room for API testing",
            "max_participants": 8
        }
        
        try:
            print("Creating room...")
            response = self.session.post(f"{API_BASE}/rooms", json=room_data, params={"director_id": "simple_director"})
            print(f"Room creation response status: {response.status_code}")
            if response.status_code == 200:
                room = response.json()
                print(f"Room response type: {type(room)}")
                print(f"Room response: {room}")
                self.test_data['room'] = room
                self.log_result("POST /api/rooms", True, f"Room created: {room['name']} (Code: {room['invite_code']})")
            else:
                self.log_result("POST /api/rooms", False, f"Status: {response.status_code}", response.text)
                return
        except Exception as e:
            self.log_result("POST /api/rooms", False, f"Exception: {str(e)}")
            return

        # Test get rooms for director
        try:
            print("Getting rooms...")
            response = self.session.get(f"{API_BASE}/rooms", params={"director_id": "simple_director"})
            print(f"Get rooms response status: {response.status_code}")
            if response.status_code == 200:
                rooms = response.json()
                print(f"Rooms response type: {type(rooms)}")
                print(f"Number of rooms: {len(rooms)}")
                self.log_result("GET /api/rooms", True, f"Retrieved {len(rooms)} rooms")
            else:
                self.log_result("GET /api/rooms", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("GET /api/rooms", False, f"Exception: {str(e)}")

        # Test get room details
        print("Testing room details...")
        print(f"test_data keys: {list(self.test_data.keys())}")
        if 'room' in self.test_data:
            print(f"Room data type: {type(self.test_data['room'])}")
            print(f"Room data: {self.test_data['room']}")
            room_id = self.test_data['room']['id']
            print(f"Room ID: {room_id}")
            try:
                response = self.session.get(f"{API_BASE}/rooms/{room_id}")
                if response.status_code == 200:
                    room_details = response.json()
                    self.log_result("GET /api/rooms/{room_id}", True, f"Room details retrieved with {len(room_details.get('participants', []))} participants")
                else:
                    self.log_result("GET /api/rooms/{room_id}", False, f"Status: {response.status_code}", response.text)
            except Exception as e:
                self.log_result("GET /api/rooms/{room_id}", False, f"Exception: {str(e)}")
        else:
            print("No room data available for testing room details")

    def run_test(self):
        """Run the test"""
        print("🚀 Starting Simple Virtual Studio Backend API Test")
        print(f"Testing against: {API_BASE}")
        print("=" * 60)
        
        self.test_room_management()
        
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
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")

def main():
    """Main test execution"""
    tester = SimpleVirtualStudioTester()
    tester.run_test()

if __name__ == "__main__":
    main()