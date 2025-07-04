import React from "react";
import { useStudio } from "../contexts/StudioContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  Monitor,
  Phone,
  PhoneOff,
  UserCheck,
  UserX,
  Settings,
  Volume2,
  VolumeX
} from "lucide-react";

const ParticipantGrid = () => {
  const { participants, updateParticipant, audioSources, videoSources } = useStudio();

  const toggleParticipantVideo = (participantId) => {
    const participant = participants.find(p => p.id === participantId);
    updateParticipant(participantId, { isVideoEnabled: !participant.isVideoEnabled });
  };

  const toggleParticipantAudio = (participantId) => {
    const participant = participants.find(p => p.id === participantId);
    updateParticipant(participantId, { isAudioEnabled: !participant.isAudioEnabled });
  };

  const kickParticipant = (participantId) => {
    // In a real app, this would remove the participant from the room
    updateParticipant(participantId, { isKicked: true });
  };

  const getParticipantVideoSource = (participantId) => {
    return videoSources.find(v => v.participantId === participantId);
  };

  const getParticipantAudioSource = (participantId) => {
    return audioSources.find(a => a.participantId === participantId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Participant Management</h2>
          <p className="text-purple-200 mt-1">
            Monitor and control all session participants
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-black/20 backdrop-blur-lg rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-200" />
              <span className="text-white font-medium">
                {participants.length} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {participants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {participants.map((participant) => {
            const videoSource = getParticipantVideoSource(participant.id);
            const audioSource = getParticipantAudioSource(participant.id);
            
            return (
              <Card 
                key={participant.id} 
                className="bg-black/20 backdrop-blur-lg border-white/10 transition-all duration-300 hover:bg-black/30"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={participant.avatar} alt={participant.name} />
                        <AvatarFallback className="bg-purple-600 text-white">
                          {participant.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-white text-lg">{participant.name}</CardTitle>
                        <CardDescription className="text-purple-200">
                          {participant.role}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      className={
                        participant.isVideoEnabled || participant.isAudioEnabled 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-600 text-white'
                      }
                    >
                      {participant.isVideoEnabled || participant.isAudioEnabled ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Video Preview */}
                  <div className="relative bg-black/40 rounded-lg h-32 flex items-center justify-center">
                    {participant.isVideoEnabled ? (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                        <Video className="w-8 h-8 text-white" />
                        <span className="text-white text-sm ml-2">Video Active</span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-800/50 rounded-lg flex items-center justify-center">
                        <VideoOff className="w-8 h-8 text-gray-400" />
                        <span className="text-gray-400 text-sm ml-2">Video Off</span>
                      </div>
                    )}
                    
                    {/* Source Info */}
                    <div className="absolute top-2 right-2">
                      {videoSource && (
                        <Badge variant="outline" className="text-xs text-white border-white/20">
                          {videoSource.type === 'screen' ? 'Screen' : 'Camera'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Audio Status */}
                  <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                    {participant.isAudioEnabled ? (
                      <Volume2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-white text-sm">
                      {audioSource?.name || 'Audio Source'}
                    </span>
                    {audioSource && (
                      <Badge variant="outline" className="text-xs text-white border-white/20 ml-auto">
                        {Math.round(audioSource.volume * 100)}%
                      </Badge>
                    )}
                  </div>

                  {/* Connection Info */}
                  <div className="text-xs text-purple-200 space-y-1">
                    <div>Joined: {new Date(participant.joinedAt).toLocaleTimeString()}</div>
                    {participant.isScreenSharing && (
                      <div className="flex items-center gap-1">
                        <Monitor className="w-3 h-3" />
                        Screen sharing active
                      </div>
                    )}
                  </div>

                  {/* Control Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={participant.isVideoEnabled ? "default" : "outline"}
                      onClick={() => toggleParticipantVideo(participant.id)}
                      className="flex-1"
                    >
                      {participant.isVideoEnabled ? (
                        <Video className="w-4 h-4 mr-2" />
                      ) : (
                        <VideoOff className="w-4 h-4 mr-2" />
                      )}
                      Video
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={participant.isAudioEnabled ? "default" : "outline"}
                      onClick={() => toggleParticipantAudio(participant.id)}
                      className="flex-1"
                    >
                      {participant.isAudioEnabled ? (
                        <Mic className="w-4 h-4 mr-2" />
                      ) : (
                        <MicOff className="w-4 h-4 mr-2" />
                      )}
                      Audio
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => kickParticipant(participant.id)}
                      className="px-3"
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No participants online</h3>
          <p className="text-purple-200 mb-4">
            Invite participants to join your studio session
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Users className="w-4 h-4 mr-2" />
            Invite Participants
          </Button>
        </div>
      )}
    </div>
  );
};

export default ParticipantGrid;