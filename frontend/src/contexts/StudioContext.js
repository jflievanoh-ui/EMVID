import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext"; // Tu contexto de auth que maneja JWT

const StudioContext = createContext();

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error("useStudio must be used within a StudioProvider");
  }
  return context;
};

export const StudioProvider = ({ children }) => {
  const { token, user } = useAuth(); // JWT token y usuario
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [audioSources, setAudioSources] = useState([]);
  const [videoSources, setVideoSources] = useState([]);
  const [midiDevices, setMidiDevices] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const API_URL = "https://tu-backend.com/api";
  const WS_URL = "wss://tu-backend.com/ws/studio";

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  // 🔹 Fetch initial data
  useEffect(() => {
    if (!token) return;

    const fetchStudioData = async () => {
      try {
        const [roomsRes, participantsRes, audioRes, videoRes, midiRes] = await Promise.all([
          fetch(`${API_URL}/rooms`, { headers: authHeaders }),
          fetch(`${API_URL}/participants`, { headers: authHeaders }),
          fetch(`${API_URL}/audio-sources`, { headers: authHeaders }),
          fetch(`${API_URL}/video-sources`, { headers: authHeaders }),
          fetch(`${API_URL}/midi-devices`, { headers: authHeaders })
        ]);

        setRooms(await roomsRes.json());
        setParticipants(await participantsRes.json());
        setAudioSources(await audioRes.json());
        setVideoSources(await videoRes.json());
        setMidiDevices(await midiRes.json());
      } catch (error) {
        console.error("Failed to fetch studio data:", error);
      }
    };

    fetchStudioData();
  }, [token]);

  // 🔹 WebSocket con JWT
  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => console.log("Connected to Studio WS with JWT");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "ROOM_UPDATE":
          setRooms(data.rooms);
          break;
        case "PARTICIPANT_UPDATE":
          setParticipants(data.participants);
          break;
        case "AUDIO_UPDATE":
          setAudioSources(data.audioSources);
          break;
        case "VIDEO_UPDATE":
          setVideoSources(data.videoSources);
          break;
        case "MIDI_UPDATE":
          setMidiDevices(data.midiDevices);
          break;
        default:
          console.log("Unknown WS event:", data);
      }
    };

    ws.onerror = (err) => console.error("WS error:", err);
    ws.onclose = () => console.log("WS disconnected");

    return () => ws.close();
  }, [token]);

  // 🔹 CRUD con autenticación
  const createRoom = async (roomData) => {
    if (!user || user.role !== "director") throw new Error("Unauthorized");

    const res = await fetch(`${API_URL}/rooms`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(roomData)
    });
    const newRoom = await res.json();
    setRooms(prev => [...prev, newRoom]);
    return newRoom;
  };

  const joinRoom = async (roomId, participant) => {
    const res = await fetch(`${API_URL}/rooms/${roomId}/join`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(participant)
    });
    const updatedRoom = await res.json();
    setRooms(prev => prev.map(r => r.id === roomId ? updatedRoom : r));
    setParticipants(prev => [...prev, participant]);
  };

  const leaveRoom = async (roomId, participantId) => {
    await fetch(`${API_URL}/rooms/${roomId}/leave`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ participantId })
    });
    setRooms(prev => prev.map(r => r.id === roomId 
      ? { ...r, participants: r.participants.filter(p => p.id !== participantId) } 
      : r
    ));
    setParticipants(prev => prev.filter(p => p.id !== participantId));
  };

  const updateParticipant = async (participantId, updates) => {
    const res = await fetch(`${API_URL}/participants/${participantId}`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify(updates)
    });
    const updated = await res.json();
    setParticipants(prev => prev.map(p => p.id === participantId ? updated : p));
  };

  const toggleRecording = async () => {
    if (!user || user.role !== "director") return;
    const res = await fetch(`${API_URL}/studio/recording`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ isRecording: !isRecording })
    });
    if (res.ok) setIsRecording(prev => !prev);
  };

  const toggleStreaming = async () => {
    if (!user || user.role !== "director") return;
    const res = await fetch(`${API_URL}/studio/streaming`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ isStreaming: !isStreaming })
    });
    if (res.ok) setIsStreaming(prev => !prev);
  };

  const updateAudioSource = async (sourceId, updates) => {
    const res = await fetch(`${API_URL}/audio-sources/${sourceId}`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify(updates)
    });
    const updated = await res.json();
    setAudioSources(prev => prev.map(s => s.id === sourceId ? updated : s));
  };

  const updateVideoSource = async (sourceId, updates) => {
    const res = await fetch(`${API_URL}/video-sources/${sourceId}`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify(updates)
    });
    const updated = await res.json();
    setVideoSources(prev => prev.map(s => s.id === sourceId ? updated : s));
  };

  const value = {
    rooms,
    activeRoom,
    setActiveRoom,
    participants,
    audioSources,
    videoSources,
    midiDevices,
    isRecording,
    isStreaming,
    createRoom,
    joinRoom,
    leaveRoom,
    updateParticipant,
    toggleRecording,
    toggleStreaming,
    updateAudioSource,
    updateVideoSource
  };

  return (
    <StudioContext.Provider value={value}>
      {children}
    </StudioContext.Provider>
  );
};
