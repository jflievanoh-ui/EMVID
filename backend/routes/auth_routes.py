# backend/routes/auth_routes.py

from fastapi import APIRouter, HTTPException
from models import User, UserCreate, UserLogin, UserRole
import uuid
from datetime import datetime

router = APIRouter()

# 🧪 In-memory user store (demo only)
users_db = {}

@router.post("/register", response_model=User)
async def register_user(user_data: UserCreate):
    """Register a new user (director or participant)"""
    
    # Check if email already exists
    if user_data.email:
        if any(u["email"] == user_data.email for u in users_db.values()):
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate user ID
    user_id = str(uuid.uuid4())

    # Create user object
    user = User(
        id=user_id,
        name=user_data.name,
        email=user_data.email,
        role=user_data.role,
        avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data.name}",
        created_at=datetime.utcnow()
    )

    # Store user
    users_db[user_id] = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "avatar": user.avatar,
        "password": user_data.password,  # 🔐 In production, hash this
        "created_at": user.created_at
    }

    return user

@router.post("/login", response_model=User)
async def login_user(login_data: UserLogin):
    """Login user (simplified authentication)"""

    # Find user by email or name
    user_record = next(
        (u for u in users_db.values()
         if (login_data.email and u["email"] == login_data.email) or
            (login_data.name and u["name"] == login_data.name)),
        None
    )

    # Auto-register if not found (demo behavior)
    if not user_record:
        new_user_data = UserCreate(
            name=login_data.name,
            email=login_data.email,
            password=login_data.password,
            role=UserRole.DIRECTOR if login_data.password else UserRole.PARTICIPANT
        )
        return await register_user(new_user_data)

    # Check password
    if login_data.password and user_record["password"] != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return User(**user_record)

@router.post("/join-room", response_model=User)
async def join_room_as_participant(join_data: dict):
    """Join room as participant (simplified)"""

    participant_name = join_data.get("participant_name")
    room_code = join_data.get("room_code")

    if not participant_name or not room_code:
        raise HTTPException(status_code=400, detail="Participant name and room code required")

    # Create participant user
    user_data = UserCreate(
        name=participant_name,
        role=UserRole.PARTICIPANT
    )

    return await register_user(user_data)

@router.get("/user/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get user by ID"""

    user_record = users_db.get(user_id)
    if not user_record:
        raise HTTPException(status_code=404, detail="User not found")

    return User(**user_record)

@router.get("/users", response_model=list[User])
async def list_users():
    """List all users (demo only)"""
    return [User(**u) for u in users_db.values()]
