from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid


class UserRole(str, Enum):
    DIRECTOR = "director"
    PARTICIPANT = "participant"


class RoomStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class SourceType(str, Enum):
    MICROPHONE = "microphone" 
    MUSIC = "music"
    CAMERA = "camera"
    SCREEN = "screen"


# User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: Optional[str] = None
    role: UserRole
    avatar: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(BaseModel):
    name: str
    email: Optional[str] = None
    password: Optional[str] = None
    role: UserRole = UserRole.DIRECTOR


class UserLogin(BaseModel):
    name: str
    email: Optional[str] = None
    password: Optional[str] = None


# Room Models
class Room(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    invite_code: str = Field(default_factory=lambda: str(uuid.uuid4())[:8].upper())
    max_participants: int = 12
    status: RoomStatus = RoomStatus.ACTIVE
    director_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    participants: List[str] = []  # List of participant IDs


class RoomCreate(BaseModel):
    name: str
    description: Optional[str] = None
    max_participants: int = 12


class RoomJoin(BaseModel):
    participant_name: str
    room_code: str


# Participant Models
class Participant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    room_id: str
    role: str = "participant"
    is_video_enabled: bool = True
    is_audio_enabled: bool = True
    is_screen_sharing: bool = False
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    avatar: Optional[str] = None
    video_source_id: Optional[str] = None
    audio_source_id: Optional[str] = None


class ParticipantUpdate(BaseModel):
    is_video_enabled: Optional[bool] = None
    is_audio_enabled: Optional[bool] = None
    is_screen_sharing: Optional[bool] = None


# Audio Source Models
class AudioSource(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: SourceType
    participant_id: Optional[str] = None
    room_id: str
    is_enabled: bool = True
    is_muted: bool = False
    volume: float = 0.8
    gain: float = 0.6
    lowcut: bool = False
    compressor: bool = True
    gate: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AudioSourceUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    is_muted: Optional[bool] = None
    volume: Optional[float] = None
    gain: Optional[float] = None
    lowcut: Optional[bool] = None
    compressor: Optional[bool] = None
    gate: Optional[bool] = None


# Video Source Models
class VideoSource(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: SourceType
    participant_id: Optional[str] = None
    room_id: str
    is_enabled: bool = True
    resolution: str = "1920x1080"
    fps: int = 30
    aspect_ratio: str = "16:9"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class VideoSourceUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    resolution: Optional[str] = None
    fps: Optional[int] = None


# Audio/Video Route Models
class Route(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    room_id: str
    type: str  # "audio" or "video"
    source_id: str
    destinations: List[str]  # List of participant IDs or OBS outputs
    is_active: bool = True
    volume: Optional[float] = 0.8  # For audio routes
    quality: Optional[str] = "1080p"  # For video routes
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RouteCreate(BaseModel):
    room_id: str
    type: str
    source_id: str
    destinations: List[str]
    volume: Optional[float] = 0.8
    quality: Optional[str] = "1080p"


class RouteUpdate(BaseModel):
    destinations: Optional[List[str]] = None
    is_active: Optional[bool] = None
    volume: Optional[float] = None
    quality: Optional[str] = None


# MIDI Device Models
class MidiDevice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str = "controller"
    room_id: str
    is_connected: bool = False
    mappings: List[Dict[str, str]] = []  # List of control mappings
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MidiMapping(BaseModel):
    control: str  # e.g., "fader_1", "knob_1", "button_1"
    parameter: str  # e.g., "volume", "gain", "mute"
    target: str  # Target source ID


class MidiDeviceUpdate(BaseModel):
    is_connected: Optional[bool] = None
    mappings: Optional[List[Dict[str, str]]] = None


# Session Models
class Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    room_id: str
    is_recording: bool = False
    is_streaming: bool = False
    recording_start_time: Optional[datetime] = None
    streaming_start_time: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SessionUpdate(BaseModel):
    is_recording: Optional[bool] = None
    is_streaming: Optional[bool] = None


# WebRTC Signaling Models
class SignalingMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    room_id: str
    participant_id: str
    target_participant_id: Optional[str] = None  # For direct messages
    type: str  # "offer", "answer", "ice-candidate", "join", "leave"
    data: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Response Models
class RoomResponse(BaseModel):
    room: Room
    participants: List[Participant]
    audio_sources: List[AudioSource]
    video_sources: List[VideoSource]
    routes: List[Route]


class SessionResponse(BaseModel):
    session: Session
    room: Room
    participants: List[Participant]