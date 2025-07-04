import React from "react";
import { useStudio } from "../contexts/StudioContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { 
  Video, 
  VideoOff, 
  Monitor, 
  Camera,
  Settings,
  Eye,
  EyeOff,
  Maximize,
  Copy
} from "lucide-react";

const VideoSources = () => {
  const { videoSources, updateVideoSource } = useStudio();

  const toggleVideoSource = (sourceId) => {
    const source = videoSources.find(s => s.id === sourceId);
    updateVideoSource(sourceId, { isEnabled: !source.isEnabled });
  };

  const updateResolution = (sourceId, resolution) => {
    updateVideoSource(sourceId, { resolution });
  };

  const updateFrameRate = (sourceId, fps) => {
    updateVideoSource(sourceId, { fps: parseInt(fps) });
  };

  const copyOBSUrl = (sourceId) => {
    // In a real app, this would be the actual OBS browser source URL
    const obsUrl = `obs://localhost:3000/source/${sourceId}`;
    navigator.clipboard.writeText(obsUrl);
  };

  const getSourceIcon = (type) => {
    switch (type) {
      case 'camera':
        return <Camera className="w-5 h-5 text-white" />;
      case 'screen':
        return <Monitor className="w-5 h-5 text-white" />;
      default:
        return <Video className="w-5 h-5 text-white" />;
    }
  };

  const getSourceColor = (type) => {
    switch (type) {
      case 'camera':
        return 'bg-blue-600';
      case 'screen':
        return 'bg-green-600';
      default:
        return 'bg-purple-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Video Sources</h2>
          <p className="text-purple-200 mt-1">
            Manage video feeds for OBS integration
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-black/20 backdrop-blur-lg rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-purple-200" />
              <span className="text-white font-medium">
                {videoSources.filter(s => s.isEnabled).length} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {videoSources.map((source) => (
          <Card 
            key={source.id} 
            className="bg-black/20 backdrop-blur-lg border-white/10"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getSourceColor(source.type)}`}>
                    {getSourceIcon(source.type)}
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{source.name}</CardTitle>
                    <CardDescription className="text-purple-200">
                      {source.type === 'camera' ? 'Camera Feed' : 'Screen Share'}
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  className={
                    source.isEnabled 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-white'
                  }
                >
                  {source.isEnabled ? 'Active' : 'Disabled'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Video Preview */}
              <div className="relative bg-black/40 rounded-lg h-48 flex items-center justify-center">
                {source.isEnabled ? (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                    {getSourceIcon(source.type)}
                    <span className="text-white text-sm ml-2">
                      {source.resolution} @ {source.fps}fps
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-800/50 rounded-lg flex items-center justify-center">
                    <VideoOff className="w-12 h-12 text-gray-400" />
                    <span className="text-gray-400 text-sm ml-2">Source Disabled</span>
                  </div>
                )}
                
                {/* Aspect Ratio Badge */}
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="text-xs text-white border-white/20">
                    {source.aspectRatio}
                  </Badge>
                </div>
              </div>

              {/* Video Settings */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Resolution</Label>
                    <Select 
                      value={source.resolution} 
                      onValueChange={(value) => updateResolution(source.id, value)}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        <SelectItem value="1920x1080">1920x1080 (1080p)</SelectItem>
                        <SelectItem value="1280x720">1280x720 (720p)</SelectItem>
                        <SelectItem value="640x480">640x480 (480p)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Frame Rate</Label>
                    <Select 
                      value={source.fps.toString()} 
                      onValueChange={(value) => updateFrameRate(source.id, value)}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        <SelectItem value="60">60 FPS</SelectItem>
                        <SelectItem value="30">30 FPS</SelectItem>
                        <SelectItem value="24">24 FPS</SelectItem>
                        <SelectItem value="15">15 FPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Source Info */}
                <div className="bg-white/5 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200 text-sm">Stream Quality</span>
                    <span className="text-white text-sm font-mono">
                      {source.resolution} @ {source.fps}fps
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200 text-sm">Aspect Ratio</span>
                    <span className="text-white text-sm font-mono">
                      {source.aspectRatio}
                    </span>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={source.isEnabled ? "default" : "outline"}
                  onClick={() => toggleVideoSource(source.id)}
                  className="flex-1"
                >
                  {source.isEnabled ? (
                    <Eye className="w-4 h-4 mr-2" />
                  ) : (
                    <EyeOff className="w-4 h-4 mr-2" />
                  )}
                  {source.isEnabled ? 'Disable' : 'Enable'}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyOBSUrl(source.id)}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy OBS URL
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {videoSources.length === 0 && (
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No video sources available</h3>
          <p className="text-purple-200 mb-4">
            Video sources will appear here when participants join
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoSources;