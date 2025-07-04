import React from "react";
import { useStudio } from "../contexts/StudioContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Settings,
  Headphones,
  Radio,
  Filter,
  Zap
} from "lucide-react";

const AudioMixer = () => {
  const { audioSources, updateAudioSource } = useStudio();

  const toggleMute = (sourceId) => {
    const source = audioSources.find(s => s.id === sourceId);
    updateAudioSource(sourceId, { isMuted: !source.isMuted });
  };

  const updateVolume = (sourceId, volume) => {
    updateAudioSource(sourceId, { volume: volume[0] });
  };

  const updateGain = (sourceId, gain) => {
    updateAudioSource(sourceId, { gain: gain[0] });
  };

  const toggleSetting = (sourceId, setting) => {
    const source = audioSources.find(s => s.id === sourceId);
    updateAudioSource(sourceId, { [setting]: !source[setting] });
  };

  const getVolumeColor = (volume) => {
    if (volume > 0.8) return "bg-red-500";
    if (volume > 0.6) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Audio Mixer</h2>
          <p className="text-purple-200 mt-1">
            Professional audio mixing and control
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-black/20 backdrop-blur-lg rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-purple-200" />
              <span className="text-white font-medium">
                {audioSources.filter(s => s.isEnabled && !s.isMuted).length} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {audioSources.map((source) => (
          <Card 
            key={source.id} 
            className="bg-black/20 backdrop-blur-lg border-white/10"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    source.type === 'microphone' ? 'bg-blue-600' : 'bg-purple-600'
                  }`}>
                    {source.type === 'microphone' ? (
                      <Mic className="w-5 h-5 text-white" />
                    ) : (
                      <Radio className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{source.name}</CardTitle>
                    <CardDescription className="text-purple-200">
                      {source.type === 'microphone' ? 'Microphone' : 'Music Track'}
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  className={
                    source.isEnabled && !source.isMuted 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-white'
                  }
                >
                  {source.isEnabled ? (source.isMuted ? 'Muted' : 'Live') : 'Offline'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Volume Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white font-medium">Volume</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-mono">
                      {Math.round(source.volume * 100)}%
                    </span>
                    <Button
                      size="sm"
                      variant={source.isMuted ? "destructive" : "outline"}
                      onClick={() => toggleMute(source.id)}
                    >
                      {source.isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="relative">
                  <Slider
                    value={[source.volume]}
                    onValueChange={(value) => updateVolume(source.id, value)}
                    max={1}
                    min={0}
                    step={0.01}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-purple-200 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Gain Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white font-medium">Gain</Label>
                  <span className="text-white text-sm font-mono">
                    {Math.round(source.gain * 100)}%
                  </span>
                </div>
                
                <Slider
                  value={[source.gain]}
                  onValueChange={(value) => updateGain(source.id, value)}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
              </div>

              {/* Audio Processing */}
              <div className="space-y-4">
                <Label className="text-white font-medium">Audio Processing</Label>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-purple-200" />
                      <span className="text-white text-sm">Low Cut Filter</span>
                    </div>
                    <Switch
                      checked={source.lowcut}
                      onCheckedChange={() => toggleSetting(source.id, 'lowcut')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-200" />
                      <span className="text-white text-sm">Compressor</span>
                    </div>
                    <Switch
                      checked={source.compressor}
                      onCheckedChange={() => toggleSetting(source.id, 'compressor')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-purple-200" />
                      <span className="text-white text-sm">Noise Gate</span>
                    </div>
                    <Switch
                      checked={source.gate}
                      onCheckedChange={() => toggleSetting(source.id, 'gate')}
                    />
                  </div>
                </div>
              </div>

              {/* Level Meter */}
              <div className="space-y-2">
                <Label className="text-white font-medium">Level Meter</Label>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-150 ${getVolumeColor(source.volume)}`}
                    style={{ width: `${source.volume * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-purple-200">
                  <span>-∞</span>
                  <span>-12dB</span>
                  <span>-6dB</span>
                  <span>0dB</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {audioSources.length === 0 && (
        <div className="text-center py-12">
          <Volume2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No audio sources available</h3>
          <p className="text-purple-200 mb-4">
            Audio sources will appear here when participants join
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioMixer;