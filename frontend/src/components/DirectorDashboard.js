import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useStudio } from "../contexts/StudioContext";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  Settings, 
  Play, 
  Square, 
  Monitor,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  LogOut,
  Plus,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";
import RoomManager from "./RoomManager";
import ParticipantGrid from "./ParticipantGrid";
import AudioMixer from "./AudioMixer";
import VideoSources from "./VideoSources";
import MidiController from "./MidiController";
import AudioVideoRouter from "./AudioVideoRouter";
import { toast } from "sonner";

const DirectorDashboard = () => {
  const { user, logout } = useAuth();
  const { 
    rooms, 
    activeRoom, 
    setActiveRoom, 
    participants, 
    audioSources, 
    videoSources, 
    midiDevices, 
    isRecording, 
    isStreaming,
    toggleRecording,
    toggleStreaming 
  } = useStudio();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user || user.role !== "director") {
      navigate("/");
    }
  }, [user, navigate]);

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
  const activeSources = [...audioSources, ...videoSources].filter(s => s.isEnabled);

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
            {/* Recording Status */}
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleRecording}
                size="sm"
                variant={isRecording ? "destructive" : "outline"}
                className={isRecording ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {isRecording ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>
              
              <Button
                onClick={toggleStreaming}
                size="sm"
                variant={isStreaming ? "destructive" : "outline"}
                className={isStreaming ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <Radio className="w-4 h-4 mr-2" />
                {isStreaming ? "Stop Stream" : "Start Stream"}
              </Button>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0)}
                </span>
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
          <TabsList className="grid w-full grid-cols-6 mb-6 bg-black/20 backdrop-blur-lg">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Rooms
            </TabsTrigger>
            <TabsTrigger value="participants" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Participants
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="midi" className="flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              MIDI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Status Cards */}
              <div className="space-y-4">
                <Card className="bg-black/20 backdrop-blur-lg border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Active Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-2">
                      {activeParticipants.length}
                    </div>
                    <p className="text-purple-200 text-sm">
                      {activeParticipants.length} participants online
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-black/20 backdrop-blur-lg border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Volume2 className="w-5 h-5" />
                      Audio Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-2">
                      {audioSources.filter(s => s.isEnabled).length}
                    </div>
                    <p className="text-purple-200 text-sm">
                      {audioSources.filter(s => s.isEnabled && !s.isMuted).length} unmuted
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-black/20 backdrop-blur-lg border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Video Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-2">
                      {videoSources.filter(s => s.isEnabled).length}
                    </div>
                    <p className="text-purple-200 text-sm">
                      {videoSources.filter(s => s.isEnabled).length} active streams
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Active Room */}
              <div className="lg:col-span-2">
                <Card className="bg-black/20 backdrop-blur-lg border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Active Room</CardTitle>
                    <CardDescription className="text-purple-200">
                      Current session overview
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activeRoom ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-white">
                              {activeRoom.name}
                            </h3>
                            <p className="text-purple-200">{activeRoom.description}</p>
                          </div>
                          <Badge className="bg-green-600 text-white">
                            {activeRoom.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">Room Code:</span>
                            <Badge variant="outline" className="font-mono text-white border-white/20">
                              {activeRoom.inviteCode}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyInviteLink(activeRoom.inviteCode)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="text-2xl font-bold text-white">
                              {activeRoom.participants?.length || 0}
                            </div>
                            <div className="text-purple-200 text-sm">Participants</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="text-2xl font-bold text-white">
                              {activeRoom.maxParticipants}
                            </div>
                            <div className="text-purple-200 text-sm">Max Capacity</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No active room selected</p>
                        <Button
                          className="mt-4"
                          onClick={() => setActiveTab("rooms")}
                        >
                          Select a Room
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rooms">
            <RoomManager />
          </TabsContent>

          <TabsContent value="participants">
            <ParticipantGrid />
          </TabsContent>

          <TabsContent value="audio">
            <AudioMixer />
          </TabsContent>

          <TabsContent value="video">
            <VideoSources />
          </TabsContent>

          <TabsContent value="midi">
            <MidiController />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DirectorDashboard;