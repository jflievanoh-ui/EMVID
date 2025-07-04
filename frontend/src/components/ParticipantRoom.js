import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useStudio } from "../contexts/StudioContext";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor,
  MonitorOff,
  Phone,
  PhoneOff,
  Users,
  Settings,
  LogOut,
  Maximize,
  Minimize
} from "lucide-react";
import { toast } from "sonner";

const ParticipantRoom = () => {
  const { roomId } = useParams();
  const { user, logout } = useAuth();
  const { rooms, participants, joinRoom } = useStudio();
  const navigate = useNavigate();
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "participant") {
      navigate("/");
      return;
    }

    // Find the room
    const room = rooms.find(r => r.inviteCode === roomId || r.id === roomId);
    if (!room) {
      toast.error("Room not found");
      navigate("/");
      return;
    }

    setCurrentRoom(room);
    
    // Simulate joining the room
    if (user && room) {
      const participantData = {
        id: user.id,
        name: user.name,
        role: "participant",
        isVideoEnabled,
        isAudioEnabled,
        isScreenSharing,
        joinedAt: new Date().toISOString(),
        avatar: user.avatar,
        roomId: room.id
      };
      
      joinRoom(room.id, participantData);
    }
  }, [user, roomId, rooms, navigate, joinRoom, isVideoEnabled, isAudioEnabled, isScreenSharing]);

  const handleLeaveRoom = () => {
    logout();
    navigate("/");
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    toast.success(isVideoEnabled ? "Video disabled" : "Video enabled");
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    toast.success(isAudioEnabled ? "Audio muted" : "Audio enabled");
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast.success(isScreenSharing ? "Screen sharing stopped" : "Screen sharing started");
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const roomParticipants = participants.filter(p => p.roomId === currentRoom?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="bg-green-500 p-2 rounded-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {currentRoom?.name || "Virtual Studio"}
              </h1>
              <p className="text-purple-200">
                Room: {currentRoom?.inviteCode} • {roomParticipants.length} participants
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Room Status */}
            <Badge className="bg-green-600 text-white">
              Live
            </Badge>
            
            {/* User Info */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-green-500 text-white">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-white font-medium">{user?.name}</span>
            </div>
            
            <Button onClick={handleLeaveRoom} size="sm" variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Leave Room
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Video Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Self View */}
          <Card className="bg-black/20 backdrop-blur-lg border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white">You</Badge>
                  <CardTitle className="text-white">{user?.name}</CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black/40 rounded-lg h-48 flex items-center justify-center">
                {isVideoEnabled ? (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                    <Video className="w-12 h-12 text-white" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-800/50 rounded-lg flex items-center justify-center">
                    <VideoOff className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Status Indicators */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {isAudioEnabled ? (
                    <div className="bg-green-600 p-1 rounded">
                      <Mic className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="bg-red-600 p-1 rounded">
                      <MicOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                  
                  {isScreenSharing && (
                    <div className="bg-blue-600 p-1 rounded">
                      <Monitor className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other Participants */}
          {roomParticipants.filter(p => p.id !== user?.id).map((participant) => (
            <Card key={participant.id} className="bg-black/20 backdrop-blur-lg border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={participant.avatar} alt={participant.name} />
                      <AvatarFallback className="bg-purple-500 text-white">
                        {participant.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-white">{participant.name}</CardTitle>
                  </div>
                  <Badge className="bg-purple-600 text-white">
                    {participant.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black/40 rounded-lg h-48 flex items-center justify-center">
                  {participant.isVideoEnabled ? (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center">
                      <Video className="w-12 h-12 text-white" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-800/50 rounded-lg flex items-center justify-center">
                      <VideoOff className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Indicators */}
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {participant.isAudioEnabled ? (
                      <div className="bg-green-600 p-1 rounded">
                        <Mic className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="bg-red-600 p-1 rounded">
                        <MicOff className="w-3 h-3 text-white" />
                      </div>
                    )}
                    
                    {participant.isScreenSharing && (
                      <div className="bg-blue-600 p-1 rounded">
                        <Monitor className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                variant={isVideoEnabled ? "default" : "outline"}
                onClick={toggleVideo}
                className={isVideoEnabled ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {isVideoEnabled ? (
                  <Video className="w-5 h-5 mr-2" />
                ) : (
                  <VideoOff className="w-5 h-5 mr-2" />
                )}
                {isVideoEnabled ? "Video On" : "Video Off"}
              </Button>
              
              <Button
                size="lg"
                variant={isAudioEnabled ? "default" : "outline"}
                onClick={toggleAudio}
                className={isAudioEnabled ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isAudioEnabled ? (
                  <Mic className="w-5 h-5 mr-2" />
                ) : (
                  <MicOff className="w-5 h-5 mr-2" />
                )}
                {isAudioEnabled ? "Mic On" : "Mic Off"}
              </Button>
              
              <Button
                size="lg"
                variant={isScreenSharing ? "default" : "outline"}
                onClick={toggleScreenShare}
                className={isScreenSharing ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                {isScreenSharing ? (
                  <Monitor className="w-5 h-5 mr-2" />
                ) : (
                  <MonitorOff className="w-5 h-5 mr-2" />
                )}
                {isScreenSharing ? "Stop Sharing" : "Share Screen"}
              </Button>
              
              <Button
                size="lg"
                variant="destructive"
                onClick={handleLeaveRoom}
              >
                <PhoneOff className="w-5 h-5 mr-2" />
                Leave Room
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParticipantRoom;