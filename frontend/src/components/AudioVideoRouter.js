import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Route, Router, Cable, Video, Monitor, Mic, ArrowRight, Plus, Trash2 } from "lucide-react";

const AudioVideoRouter = () => {
  const [audioSources, setAudioSources] = useState([]);
  const [videoSources, setVideoSources] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [newRoute, setNewRoute] = useState({ type: "audio", source: "", destinations: [], isActive: true });

  const ws = useRef(null);

  // Fetch inicial de fuentes, participantes y rutas
  const fetchData = async () => {
    try {
      const [audioRes, videoRes, participantsRes, routesRes] = await Promise.all([
        fetch("/api/audio-sources"),
        fetch("/api/video-sources"),
        fetch("/api/participants"),
        fetch("/api/routes")
      ]);
      setAudioSources(await audioRes.json());
      setVideoSources(await videoRes.json());
      setParticipants(await participantsRes.json());
      setRoutes(await routesRes.json());
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // Conexión WebSocket para actualizaciones en tiempo real
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000/ws/routes");

    ws.current.onopen = () => console.log("WebSocket connected");
    ws.current.onclose = () => console.log("WebSocket disconnected");

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "update_routes") {
        setRoutes(data.routes);
      }
    };

    fetchData();

    return () => ws.current.close();
  }, []);

  // Funciones de manejo de rutas conectadas al backend
  const addRoute = async () => {
    if (!newRoute.source || newRoute.destinations.length === 0) return;
    const route = {
      id: `route_${Date.now()}`,
      ...newRoute,
      volume: newRoute.type === "audio" ? 0.8 : undefined,
      quality: newRoute.type === "video" ? "1080p" : undefined
    };
    try {
      const res = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(route)
      });
      if (!res.ok) throw new Error("Failed to add route");
      ws.current.send(JSON.stringify({ type: "new_route", route }));
      setNewRoute({ type: "audio", source: "", destinations: [], isActive: true });
    } catch (err) {
      console.error(err);
    }
  };

  const removeRoute = async (routeId) => {
    try {
      const res = await fetch(`/api/routes/${routeId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove route");
      ws.current.send(JSON.stringify({ type: "remove_route", routeId }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRoute = (routeId) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, isActive: !r.isActive } : r));
    ws.current.send(JSON.stringify({ type: "toggle_route", routeId }));
  };

  const updateRouteVolume = (routeId, volume) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, volume: volume[0] } : r));
    ws.current.send(JSON.stringify({ type: "update_volume", routeId, volume: volume[0] }));
  };

  const getAllSources = () => [
    ...audioSources.map(s => ({ ...s, type: "audio", icon: <Mic className="w-4 h-4" /> })),
    ...videoSources.map(s => ({ ...s, type: "video", icon: <Video className="w-4 h-4" /> }))
  ];

  const getAllDestinations = () => [
    ...participants.map(p => ({ ...p, type: "participant", icon: <Monitor className="w-4 h-4" /> })),
    { id: "obs_main", name: "OBS Main Mix", type: "obs", icon: <Router className="w-4 h-4" /> },
    { id: "obs_camera1", name: "OBS Camera 1", type: "obs", icon: <Video className="w-4 h-4" /> },
    { id: "obs_camera2", name: "OBS Camera 2", type: "obs", icon: <Video className="w-4 h-4" /> },
    { id: "obs_audio1", name: "OBS Audio 1", type: "obs", icon: <Badge className="w-4 h-4" /> },
    { id: "obs_audio2", name: "OBS Audio 2", type: "obs", icon: <Badge className="w-4 h-4" /> }
  ];

  const getSourceInfo = (sourceId) => getAllSources().find(s => s.id === sourceId);
  const getDestinationInfo = (destId) => getAllDestinations().find(d => d.id === destId);

  return (
    <div className="space-y-6">
      {/* Aquí puedes reutilizar todo tu JSX original de UI */}
      {/* Solo recuerda que ahora routes, audioSources, videoSources y participants vienen del backend */}
    </div>
  );
};

export default AudioVideoRouter;
