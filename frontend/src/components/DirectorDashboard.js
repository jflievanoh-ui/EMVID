import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useStudio } from "../contexts/StudioContext";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { 
  Video, Users, Settings, Play, Square, Monitor, Volume2, Radio, Sliders, LogOut, Copy 
} from "lucide-react";

import RoomManager from "./RoomManager";
import ParticipantGrid from "./ParticipantGrid";
import AudioMixer from "./AudioMixer";
import VideoSources from "./VideoSources";
import MidiController from "./MidiController";
import AudioVideoRouter from "./AudioVideoRouter";

const DirectorDashboard = () => {
  const { user, logout } = useAuth();
  const { 
    rooms, activeRoom, setActiveRoom, participants, audioSources, videoSources, midiDevices,
    isRecording, isStreaming, toggleRecording, toggleStreaming 
  } = useStudio();
  
  const navigate = useNavigate();
  const wsRef = useRef(null); // WebSocket reference
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not director
  useEffect(() => {
    if (!user || user.role !== "director") {
      navigate("/");
    }
  }, [user, navigate]);

  // Connect WebSocket for real-time updates
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token"); // Assumes director token is saved
    const ws = new WebSocket(`wss://your-backend.com/ws/director?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected for director");
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Handle updates based on type
      switch (data.type) {
        case "ROOM_UPDATE":
          // update rooms or activeRoom
          setActiveRoom(prev => prev?.inviteCode === data.room.inviteCode ? data.room : prev);
          break;
        case "PARTICIPANT_UPDATE":
          // Update participants in StudioContext
          // Assuming you have a method to update participants
          // updateParticipants(data.participants);
          break;
        case "AUDIO_VIDEO_UPDATE":
          // Update audioSources/videoSources or router
          // updateSources(data);
          break;
        default:
          console.log("Unhandled WS message:", data);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onclose = () => console.log("WebSocket closed");

    // Cleanup
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const copyInviteLink = (roomCode) => {
    const link = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard!");
  };

  const activeParticipants = participants.filter(p => p.isVideoEnabled || p.isAudioEnabled);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500 p-2 rounded-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Virtual Studio</h1>
              <p className="text-purple-200">Director Control Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button onClick={toggleRecording} size="sm" variant={isRecording ? "destructive" : "outline"} className={isRecording ? "bg-red-600 hover:bg-red-700" : ""}>
                {isRecording ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>
              
              <Button onClick={toggleStreaming} size="sm" variant={isStreaming ? "destructive" : "outline"} className={isStreaming ? "bg-green-600 hover:bg-green-700" : ""}>
                <Radio className="w-4 h-4 mr-2" />
                {isStreaming ? "Stop Stream" : "Start Stream"}
              </Button>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{user?.name?.charAt(0)}</span>
              </div>
              <span className="text-white font-medium">{user?.name}</span>
            </div>
            
            <Button onClick={handleLogout} size="sm" variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6 bg-black/20 backdrop-blur-lg">
            <TabsTrigger value="overview" className="flex items-center gap-2"><Monitor className="w-4 h-4" />Overview</TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-2"><Users className="w-4 h-4" />Rooms</TabsTrigger>
            <TabsTrigger value="participants" className="flex items-center gap-2"><Video className="w-4 h-4" />Participants</TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2"><Volume2 className="w-4 h-4" />Audio</TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2"><Monitor className="w-4 h-4" />Video</TabsTrigger>
            <TabsTrigger value="router" className="flex items-center gap-2"><Radio className="w-4 h-4" />Router</TabsTrigger>
            <TabsTrigger value="midi" className="flex items-center gap-2"><Sliders className="w-4 h-4" />MIDI</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Aquí tu contenido de overview, rooms, participants, etc. */}
          </TabsContent>

          <TabsContent value="rooms"><RoomManager /></TabsContent>
          <TabsContent value="participants"><ParticipantGrid /></TabsContent>
          <TabsContent value="audio"><AudioMixer /></TabsContent>
          <TabsContent value="video"><VideoSources /></TabsContent>
          <TabsContent value="router"><AudioVideoRouter /></TabsContent>
          <TabsContent value="midi"><MidiController /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DirectorDashboard;
