import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useStudio } from "../contexts/StudioContext";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
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
  Minimize,
  Volume2,
  VolumeX,
  Headphones,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";

const EnhancedParticipantRoom = () => {
  const { roomId } = useParams();
  const { user, logout } = useAuth();
  const { rooms, participants, joinRoom, audioSources } = useStudio();
  const navigate = useNavigate();
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  
  // Audio/Video routing states
  const [localVolume, setLocalVolume] = useState(0.8);
  const [participantVolumes, setParticipantVolumes] = useState({});
  const [participantVideoVisibility, setParticipantVideoVisibility] = useState({});
  const [selectedAudioOutput, setSelectedAudioOutput] = useState("speakers");

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
    
    // Initialize participant volumes and visibility
    const roomParticipants = participants.filter(p => p.roomId === room.id);
    const initialVolumes = {};
    const initialVisibility = {};
    
    roomParticipants.forEach(p => {
      if (p.id !== user.id) {
        initialVolumes[p.id] = 0.8;
        initialVisibility[p.id] = true;
      }
    });
    
    setParticipantVolumes(initialVolumes);
    setParticipantVideoVisibility(initialVisibility);
    
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

  const updateParticipantVolume = (participantId, volume) => {
    setParticipantVolumes(prev => ({
      ...prev,
      [participantId]: volume[0]
    }));
  };

  const toggleParticipantVideo = (participantId) => {
    setParticipantVideoVisibility(prev => ({
      ...prev,
      [participantId]: !prev[participantId]
    }));
  };

  const roomParticipants = participants.filter(p => p.roomId === currentRoom?.id);
  const otherParticipants = roomParticipants.filter(p => p.id !== user?.id);

  // Simulate real-time video feed
  const generateVideoFeed = (participant, isActive) => {
    if (!isActive) {
      return (
        <div className="w-full h-full bg-gray-800/50 rounded-lg flex items-center justify-center">
          <VideoOff className="w-12 h-12 text-gray-400" />
        </div>
      );
    }

    // Different colors for different participants
    const colors = {
      [user?.id]: 'from-blue-600/20 to-purple-600/20',
      'participant_1': 'from-purple-600/20 to-pink-600/20',
      'participant_2': 'from-green-600/20 to-blue-600/20',
      'participant_3': 'from-orange-600/20 to-red-600/20'
    };

    const color = colors[participant.id] || 'from-gray-600/20 to-gray-400/20';

    return (
      <div className={`w-full h-full bg-gradient-to-br ${color} rounded-lg flex items-center justify-center relative`}>
        <Video className="w-8 h-8 text-white" />
        {/* Simulated video activity */}
        <div className="absolute top-2 left-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        {/* Audio level indicator */}
        {participant.isAudioEnabled && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className={`w-1 h-${2 + i} bg-green-500 rounded-full animate-pulse`}
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

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
            
            {/* Audio Output Selector */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
              <Headphones className="w-4 h-4 text-purple-200" />
              <span className="text-white text-sm">Speakers</span>
            </div>
            
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
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative bg-black/40 rounded-lg h-48 overflow-hidden">
                {generateVideoFeed({ id: user?.id, isVideoEnabled, isAudioEnabled }, isVideoEnabled)}
                
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

                {/* Self Audio Level */}
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="text-xs text-white border-white/20">
                    You
                  </Badge>
                </div>
              </div>

              {/* Self Audio Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white text-sm">Your Volume</Label>
                  <span className="text-white text-sm font-mono">
                    {Math.round(localVolume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[localVolume]}
                  onValueChange={(value) => setLocalVolume(value[0])}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Other Participants */}
          {otherParticipants.map((participant) => (
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
                    <CardTitle className="text-white text-sm">{participant.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className="bg-purple-600 text-white text-xs">
                      {participant.role}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleParticipantVideo(participant.id)}
                      className="px-2"
                    >
                      {participantVideoVisibility[participant.id] ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="relative bg-black/40 rounded-lg h-48 overflow-hidden">
                  {participantVideoVisibility[participant.id] 
                    ? generateVideoFeed(participant, participant.isVideoEnabled)
                    : (
                      <div className="w-full h-full bg-gray-800/80 rounded-lg flex items-center justify-center">
                        <EyeOff className="w-12 h-12 text-gray-400" />
                        <span className="text-gray-400 text-sm ml-2">Video Hidden</span>
                      </div>
                    )
                  }
                  
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

                  {/* Connection Quality */}
                  <div className="absolute top-2 right-2">
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div 
                          key={i}
                          className="w-1 h-3 bg-green-500 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Participant Audio Controls */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white text-sm">{participant.name} Volume</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-mono">
                        {Math.round((participantVolumes[participant.id] || 0.8) * 100)}%
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateParticipantVolume(participant.id, [0])}
                        className="px-2"
                      >
                        {participantVolumes[participant.id] > 0 ? (
                          <Volume2 className="w-3 h-3" />
                        ) : (
                          <VolumeX className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Slider
                    value={[participantVolumes[participant.id] || 0.8]}
                    onValueChange={(value) => updateParticipantVolume(participant.id, value)}
                    max={1}
                    min={0}
                    step={0.01}
                    className="w-full"
                  />
                </div>

                {/* Connection Info */}
                <div className="text-xs text-purple-200 space-y-1">
                  <div>Joined: {new Date(participant.joinedAt).toLocaleTimeString()}</div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Connected • Good Quality
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Controls */}
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4 mb-6">
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

            {/* Audio Routing Info */}
            <div className="border-t border-white/10 pt-4">
              <div className="text-center text-purple-200 text-sm">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Audio routing active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{otherParticipants.length} participants connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    <span>OBS integration ready</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedParticipantRoom;