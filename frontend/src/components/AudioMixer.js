import React from "react";
import { useStudio } from "../contexts/StudioContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Volume2, VolumeX, Mic, Radio, Filter, Zap, Settings } from "lucide-react";

const AudioMixer = () => {
  const { audioSources = [], updateAudioSource } = useStudio();

  const toggleMute = (id) => {
    updateAudioSource(id, (prev) => ({ isMuted: !prev.isMuted }));
  };

  const updateVolume = (id, value) => {
    updateAudioSource(id, { volume: value[0] ?? 0 });
  };

  const updateGain = (id, value) => {
    updateAudioSource(id, { gain: value[0] ?? 0 });
  };

  const toggleSetting = (id, setting) => {
    updateAudioSource(id, (prev) => ({ [setting]: !prev[setting] }));
  };

  const getVolumeColor = (vol) => {
    if (vol > 0.8) return "bg-red-500";
    if (vol > 0.6) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (!audioSources.length) {
    return (
      <div className="text-center py-12">
        <Volume2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No audio sources available</h3>
        <p className="text-purple-200 mb-4">
          Audio sources will appear here when participants join
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {audioSources.map((source) => (
        <Card key={source.id} className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardHeader className="pb-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${source.type === "microphone" ? "bg-blue-600" : "bg-purple-600"}`}>
                {source.type === "microphone" ? <Mic className="w-5 h-5 text-white" /> : <Radio className="w-5 h-5 text-white" />}
              </div>
              <div>
                <CardTitle className="text-white text-lg">{source.name}</CardTitle>
                <CardDescription className="text-purple-200">
                  {source.type === "microphone" ? "Microphone" : "Music Track"}
                </CardDescription>
              </div>
            </div>
            <Badge className={`${source.isEnabled && !source.isMuted ? "bg-green-600" : "bg-gray-600"} text-white`}>
              {source.isEnabled ? (source.isMuted ? "Muted" : "Live") : "Offline"}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Volume */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-white font-medium">Volume</Label>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-mono">{Math.round(source.volume * 100)}%</span>
                  <Button size="sm" variant={source.isMuted ? "destructive" : "outline"} onClick={() => toggleMute(source.id)}>
                    {source.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Slider value={[source.volume]} onValueChange={(val) => updateVolume(source.id, val)} min={0} max={1} step={0.01} className="w-full" />
            </div>

            {/* Gain */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-white font-medium">Gain</Label>
                <span className="text-white text-sm font-mono">{Math.round(source.gain * 100)}%</span>
              </div>
              <Slider value={[source.gain]} onValueChange={(val) => updateGain(source.id, val)} min={0} max={1} step={0.01} className="w-full" />
            </div>

            {/* Audio Processing */}
            <div className="space-y-3">
              <Label className="text-white font-medium">Audio Processing</Label>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-purple-200" /><span className="text-white text-sm">Low Cut Filter</span></div>
                  <Switch checked={source.lowcut} onCheckedChange={() => toggleSetting(source.id, "lowcut")} />
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-purple-200" /><span className="text-white text-sm">Compressor</span></div>
                  <Switch checked={source.compressor} onCheckedChange={() => toggleSetting(source.id, "compressor")} />
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2"><Settings className="w-4 h-4 text-purple-200" /><span className="text-white text-sm">Noise Gate</span></div>
                  <Switch checked={source.gate} onCheckedChange={() => toggleSetting(source.id, "gate")} />
                </div>
              </div>
            </div>

            {/* Level Meter */}
            <div className="space-y-2">
              <Label className="text-white font-medium">Level Meter</Label>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-150 ${getVolumeColor(source.volume)}`} style={{ width: `${source.volume * 100}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AudioMixer;
