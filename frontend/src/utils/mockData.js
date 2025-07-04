export const mockData = {
  rooms: [
    {
      id: "room_1",
      name: "Morning Show Studio",
      description: "Daily morning news and talk show",
      maxParticipants: 8,
      createdAt: "2024-01-15T09:00:00Z",
      status: "active",
      inviteCode: "MSS2024",
      participants: [
        {
          id: "participant_1",
          name: "Sarah Johnson",
          role: "host",
          isVideoEnabled: true,
          isAudioEnabled: true,
          isScreenSharing: false,
          joinedAt: "2024-01-15T09:15:00Z",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
        },
        {
          id: "participant_2",
          name: "Mike Chen",
          role: "guest",
          isVideoEnabled: true,
          isAudioEnabled: true,
          isScreenSharing: false,
          joinedAt: "2024-01-15T09:18:00Z",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike"
        }
      ]
    },
    {
      id: "room_2",
      name: "Podcast Studio",
      description: "Weekly tech podcast recording",
      maxParticipants: 4,
      createdAt: "2024-01-14T14:00:00Z",
      status: "inactive",
      inviteCode: "TECH24",
      participants: []
    }
  ],
  
  participants: [
    {
      id: "participant_1",
      name: "Sarah Johnson",
      role: "host",
      isVideoEnabled: true,
      isAudioEnabled: true,
      isScreenSharing: false,
      joinedAt: "2024-01-15T09:15:00Z",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      videoSource: "camera_1",
      audioSource: "mic_1"
    },
    {
      id: "participant_2",
      name: "Mike Chen",
      role: "guest",
      isVideoEnabled: true,
      isAudioEnabled: true,
      isScreenSharing: false,
      joinedAt: "2024-01-15T09:18:00Z",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      videoSource: "camera_2",
      audioSource: "mic_2"
    },
    {
      id: "participant_3",
      name: "Emily Rodriguez",
      role: "guest",
      isVideoEnabled: false,
      isAudioEnabled: true,
      isScreenSharing: true,
      joinedAt: "2024-01-15T09:22:00Z",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
      videoSource: "screen_1",
      audioSource: "mic_3"
    }
  ],
  
  audioSources: [
    {
      id: "mic_1",
      name: "Sarah - Main Mic",
      type: "microphone",
      participantId: "participant_1",
      isEnabled: true,
      isMuted: false,
      volume: 0.8,
      gain: 0.6,
      lowcut: false,
      compressor: true,
      gate: false
    },
    {
      id: "mic_2",
      name: "Mike - Guest Mic",
      type: "microphone",
      participantId: "participant_2",
      isEnabled: true,
      isMuted: false,
      volume: 0.7,
      gain: 0.5,
      lowcut: true,
      compressor: false,
      gate: true
    },
    {
      id: "mic_3",
      name: "Emily - Remote Mic",
      type: "microphone",
      participantId: "participant_3",
      isEnabled: true,
      isMuted: false,
      volume: 0.6,
      gain: 0.4,
      lowcut: true,
      compressor: true,
      gate: false
    },
    {
      id: "music_1",
      name: "Background Music",
      type: "music",
      participantId: null,
      isEnabled: false,
      isMuted: true,
      volume: 0.3,
      gain: 0.2,
      lowcut: false,
      compressor: false,
      gate: false
    }
  ],
  
  videoSources: [
    {
      id: "camera_1",
      name: "Sarah - Main Camera",
      type: "camera",
      participantId: "participant_1",
      isEnabled: true,
      resolution: "1920x1080",
      fps: 30,
      aspectRatio: "16:9"
    },
    {
      id: "camera_2",
      name: "Mike - Guest Camera",
      type: "camera",
      participantId: "participant_2",
      isEnabled: true,
      resolution: "1920x1080",
      fps: 30,
      aspectRatio: "16:9"
    },
    {
      id: "screen_1",
      name: "Emily - Screen Share",
      type: "screen",
      participantId: "participant_3",
      isEnabled: true,
      resolution: "1920x1080",
      fps: 15,
      aspectRatio: "16:9"
    }
  ],
  
  midiDevices: [
    {
      id: "midi_1",
      name: "Behringer X-Touch Mini",
      type: "controller",
      isConnected: true,
      mappings: [
        { control: "fader_1", parameter: "volume", target: "mic_1" },
        { control: "fader_2", parameter: "volume", target: "mic_2" },
        { control: "fader_3", parameter: "volume", target: "mic_3" },
        { control: "knob_1", parameter: "gain", target: "mic_1" },
        { control: "knob_2", parameter: "gain", target: "mic_2" },
        { control: "button_1", parameter: "mute", target: "mic_1" },
        { control: "button_2", parameter: "mute", target: "mic_2" }
      ]
    },
    {
      id: "midi_2",
      name: "Akai APC40",
      type: "controller",
      isConnected: false,
      mappings: []
    }
  ]
};