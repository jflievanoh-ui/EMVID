import React, { useState } from "react";
import { useStudio } from "../contexts/StudioContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { 
  Route, 
  Router,
  Cable,
  Zap,
  Volume2,
  Video,
  Monitor,
  Mic,
  Settings,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2
} from "lucide-react";

const AudioVideoRouter = () => {
  const { audioSources, videoSources, participants } = useStudio();
  const [routes, setRoutes] = useState([
    {
      id: "route_1",
      type: "audio",
      source: "mic_1",
      destinations: ["participant_2", "participant_3", "obs_main"],
      isActive: true,
      volume: 0.8
    },
    {
      id: "route_2", 
      type: "video",
      source: "camera_1",
      destinations: ["participant_2", "obs_camera1"],
      isActive: true,
      quality: "1080p"
    },
    {
      id: "route_3",
      type: "audio",
      source: "mic_2",
      destinations: ["participant_1", "participant_3", "obs_main"],
      isActive: true,
      volume: 0.7
    }
  ]);

  const [newRoute, setNewRoute] = useState({
    type: "audio",
    source: "",
    destinations: [],
    isActive: true
  });

  const addRoute = () => {
    if (!newRoute.source || newRoute.destinations.length === 0) return;
    
    const route = {
      id: `route_${Date.now()}`,
      ...newRoute,
      volume: newRoute.type === "audio" ? 0.8 : undefined,
      quality: newRoute.type === "video" ? "1080p" : undefined
    };
    
    setRoutes(prev => [...prev, route]);
    setNewRoute({ type: "audio", source: "", destinations: [], isActive: true });
  };

  const removeRoute = (routeId) => {
    setRoutes(prev => prev.filter(r => r.id !== routeId));
  };

  const toggleRoute = (routeId) => {
    setRoutes(prev => prev.map(r => 
      r.id === routeId ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const updateRouteVolume = (routeId, volume) => {
    setRoutes(prev => prev.map(r => 
      r.id === routeId ? { ...r, volume: volume[0] } : r
    ));
  };

  const getAllSources = () => {
    const sources = [];
    
    // Add audio sources
    audioSources.forEach(source => {
      sources.push({
        id: source.id,
        name: source.name,
        type: "audio",
        icon: <Mic className="w-4 h-4" />
      });
    });
    
    // Add video sources
    videoSources.forEach(source => {
      sources.push({
        id: source.id,
        name: source.name,
        type: "video",
        icon: <Video className="w-4 h-4" />
      });
    });
    
    return sources;
  };

  const getAllDestinations = () => {
    const destinations = [];
    
    // Add participants
    participants.forEach(participant => {
      destinations.push({
        id: participant.id,
        name: participant.name,
        type: "participant",
        icon: <Monitor className="w-4 h-4" />
      });
    });
    
    // Add OBS outputs
    destinations.push(
      { id: "obs_main", name: "OBS Main Mix", type: "obs", icon: <Router className="w-4 h-4" /> },
      { id: "obs_camera1", name: "OBS Camera 1", type: "obs", icon: <Video className="w-4 h-4" /> },
      { id: "obs_camera2", name: "OBS Camera 2", type: "obs", icon: <Video className="w-4 h-4" /> },
      { id: "obs_audio1", name: "OBS Audio 1", type: "obs", icon: <Volume2 className="w-4 h-4" /> },
      { id: "obs_audio2", name: "OBS Audio 2", type: "obs", icon: <Volume2 className="w-4 h-4" /> }
    );
    
    return destinations;
  };

  const getSourceInfo = (sourceId) => {
    const allSources = getAllSources();
    return allSources.find(s => s.id === sourceId);
  };

  const getDestinationInfo = (destId) => {
    const allDestinations = getAllDestinations();
    return allDestinations.find(d => d.id === destId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Audio/Video Router</h2>
          <p className="text-purple-200 mt-1">
            Professional signal routing and distribution
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-black/20 backdrop-blur-lg rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-purple-200" />
              <span className="text-white font-medium">
                {routes.filter(r => r.isActive).length} Active Routes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Routing Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Active Routes */}
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Cable className="w-5 h-5" />
              Active Routes
            </CardTitle>
            <CardDescription className="text-purple-200">
              Current signal routing configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {routes.map((route) => {
              const sourceInfo = getSourceInfo(route.source);
              
              return (
                <div key={route.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={route.isActive ? "bg-green-600" : "bg-gray-600"}>
                        {route.type.toUpperCase()}
                      </Badge>
                      <Switch
                        checked={route.isActive}
                        onCheckedChange={() => toggleRoute(route.id)}
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeRoute(route.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Source to Destinations Flow */}
                  <div className="space-y-3">
                    {/* Source */}
                    <div className="flex items-center gap-2">
                      {sourceInfo?.icon}
                      <span className="text-white font-medium">{sourceInfo?.name}</span>
                      <Badge variant="outline" className="text-xs">Source</Badge>
                    </div>
                    
                    <div className="flex justify-center">
                      <ArrowRight className="w-5 h-5 text-purple-400" />
                    </div>
                    
                    {/* Destinations */}
                    <div className="space-y-2">
                      {route.destinations.map((destId) => {
                        const destInfo = getDestinationInfo(destId);
                        return (
                          <div key={destId} className="flex items-center gap-2 pl-4">
                            {destInfo?.icon}
                            <span className="text-purple-200 text-sm">{destInfo?.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {destInfo?.type}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Route Controls */}
                    {route.type === "audio" && (
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <Label className="text-white text-sm">Volume</Label>
                          <span className="text-white text-sm font-mono">
                            {Math.round(route.volume * 100)}%
                          </span>
                        </div>
                        <Slider
                          value={[route.volume]}
                          onValueChange={(value) => updateRouteVolume(route.id, value)}
                          max={1}
                          min={0}
                          step={0.01}
                          className="mt-2"
                        />
                      </div>
                    )}
                    
                    {route.type === "video" && (
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <Label className="text-white text-sm">Quality</Label>
                          <Badge variant="outline" className="text-xs">
                            {route.quality}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {routes.length === 0 && (
              <div className="text-center py-8 text-purple-200">
                <Cable className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No routes configured</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add New Route */}
        <Card className="bg-black/20 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Route
            </CardTitle>
            <CardDescription className="text-purple-200">
              Create new signal routing path
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Route Type</Label>
              <Select value={newRoute.type} onValueChange={(value) => setNewRoute(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  <SelectItem value="audio">Audio Route</SelectItem>
                  <SelectItem value="video">Video Route</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Source</Label>
              <Select value={newRoute.source} onValueChange={(value) => setNewRoute(prev => ({ ...prev, source: value }))}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {getAllSources()
                    .filter(s => s.type === newRoute.type)
                    .map(source => (
                    <SelectItem key={source.id} value={source.id}>
                      <div className="flex items-center gap-2">
                        {source.icon}
                        {source.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Destinations</Label>
              <div className="bg-white/5 rounded-lg p-3 max-h-40 overflow-y-auto">
                {getAllDestinations().map(dest => (
                  <div key={dest.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      {dest.icon}
                      <span className="text-white text-sm">{dest.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {dest.type}
                      </Badge>
                    </div>
                    <Switch
                      checked={newRoute.destinations.includes(dest.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewRoute(prev => ({ 
                            ...prev, 
                            destinations: [...prev.destinations, dest.id] 
                          }));
                        } else {
                          setNewRoute(prev => ({ 
                            ...prev, 
                            destinations: prev.destinations.filter(d => d !== dest.id) 
                          }));
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={addRoute} 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={!newRoute.source || newRoute.destinations.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Route
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Signal Flow Diagram */}
      <Card className="bg-black/20 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Router className="w-5 h-5" />
            Signal Flow Overview
          </CardTitle>
          <CardDescription className="text-purple-200">
            Visual representation of current routing matrix
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sources */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold">Sources</h3>
              {getAllSources().map(source => (
                <div key={source.id} className="flex items-center gap-2 p-2 bg-white/5 rounded">
                  {source.icon}
                  <span className="text-white text-sm">{source.name}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {source.type}
                  </Badge>
                </div>
              ))}
            </div>
            
            {/* Routes */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold">Active Routes</h3>
              {routes.filter(r => r.isActive).map(route => (
                <div key={route.id} className="flex items-center justify-center p-2 bg-purple-600/20 rounded">
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                  <Badge className="mx-2 bg-purple-600 text-white">
                    {route.type}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                </div>
              ))}
            </div>
            
            {/* Destinations */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold">Destinations</h3>
              {getAllDestinations().map(dest => (
                <div key={dest.id} className="flex items-center gap-2 p-2 bg-white/5 rounded">
                  {dest.icon}
                  <span className="text-white text-sm">{dest.name}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {dest.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioVideoRouter;