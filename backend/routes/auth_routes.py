from fastapi import APIRouter, HTTPException
from models import User, UserCreate, UserLogin, UserRole
import uuid

router = APIRouter()

# Simple in-memory user store for demo
# In production, use proper authentication with JWT tokens and password hashing
users_db = {}

@router.post("/register", response_model=User)
async def register_user(user_data: UserCreate):
    """Register a new user (director or participant)"""
    
    # Check if user already exists by email
    if user_data.email:
        for user in users_db.values():
            if user.get("email") == user_data.email:
                raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user = User(
        name=user_data.name,
        email=user_data.email,
        role=user_data.role,
        avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data.name}"
    )
    
    # Store user (in production, hash password and use database)
    users_db[user.id] = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value,
        "avatar": user.avatar,
        "password": user_data.password,  # In production: hash this
        "created_at": user.created_at
    }
    
    return user

@router.post("/login", response_model=User)
async def login_user(login_data: UserLogin):
    """Login user (simplified authentication)"""
    
    # Simple authentication - find user by name or email
    user_record = None
    
    if login_data.email:
        # Login with email
        for user in users_db.values():
            if user.get("email") == login_data.email:
                user_record = user
                break
    else:
        # Login with name (for demo purposes)
        for user in users_db.values():
            if user.get("name") == login_data.name:
                user_record = user
                break
    
    if not user_record:
        # For demo purposes, create user if not found
        user_data = UserCreate(
            name=login_data.name,
            email=login_data.email,
            password=login_data.password,
            role=UserRole.DIRECTOR if login_data.password else UserRole.PARTICIPANT
        )
        return await register_user(user_data)
    
    # In production, verify password hash here
    if login_data.password and user_record.get("password") != login_data.password:
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

@router.get("/users")
async def list_users():
    """List all users (for demo purposes)"""
    return list(users_db.values())