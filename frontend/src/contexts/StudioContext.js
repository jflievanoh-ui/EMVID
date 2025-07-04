import React, { createContext, useContext, useState, useEffect } from "react";
import { mockData } from "../utils/mockData";

const StudioContext = createContext();

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error("useStudio must be used within a StudioProvider");
  }
  return context;
};

export const StudioProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [audioSources, setAudioSources] = useState([]);
  const [videoSources, setVideoSources] = useState([]);
  const [midiDevices, setMidiDevices] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    // Load mock data
    setRooms(mockData.rooms);
    setParticipants(mockData.participants);
    setAudioSources(mockData.audioSources);
    setVideoSources(mockData.videoSources);
    setMidiDevices(mockData.midiDevices);
  }, []);

  const createRoom = (roomData) => {
    const newRoom = {
      id: "room_" + Date.now(),
      name: roomData.name,
      description: roomData.description || "",
      maxParticipants: roomData.maxParticipants || 12,
      createdAt: new Date().toISOString(),
      status: "active",
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      participants: []
    };
    
    setRooms(prev => [...prev, newRoom]);
    return newRoom;
  };

  const joinRoom = (roomId, participant) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, participants: [...room.participants, participant] }
        : room
    ));
    
    setParticipants(prev => [...prev, participant]);
  };

  const leaveRoom = (roomId, participantId) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, participants: room.participants.filter(p => p.id !== participantId) }
        : room
    ));
    
    setParticipants(prev => prev.filter(p => p.id !== participantId));
  };

  const updateParticipant = (participantId, updates) => {
    setParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, ...updates } : p
    ));
  };

  const toggleRecording = () => {
    setIsRecording(prev => !prev);
  };

  const toggleStreaming = () => {
    setIsStreaming(prev => !prev);
  };

  const updateAudioSource = (sourceId, updates) => {
    setAudioSources(prev => prev.map(source => 
      source.id === sourceId ? { ...source, ...updates } : source
    ));
  };

  const updateVideoSource = (sourceId, updates) => {
    setVideoSources(prev => prev.map(source => 
      source.id === sourceId ? { ...source, ...updates } : source
    ));
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