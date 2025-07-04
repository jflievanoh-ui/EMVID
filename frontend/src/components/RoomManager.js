import React, { useState } from "react";
import { useStudio } from "../contexts/StudioContext";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Plus, Users, Copy, Settings, Trash2, Play, Square } from "lucide-react";
import { toast } from "sonner";

const RoomManager = () => {
  const { rooms, createRoom, activeRoom, setActiveRoom } = useStudio();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    maxParticipants: 12
  });

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!newRoom.name.trim()) {
      toast.error("Room name is required");
      return;
    }
    
    const room = createRoom(newRoom);
    setActiveRoom(room);
    setIsCreateDialogOpen(false);
    setNewRoom({ name: "", description: "", maxParticipants: 12 });
    toast.success(`Room "${room.name}" created successfully!`);
  };

  const copyInviteLink = (roomCode) => {
    const link = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard!");
  };

  const copyRoomCode = (roomCode) => {
    navigator.clipboard.writeText(roomCode);
    toast.success("Room code copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Room Management</h2>
          <p className="text-purple-200 mt-1">Create and manage virtual studio rooms</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Room</DialogTitle>
              <DialogDescription className="text-purple-200">
                Set up a new virtual studio room for your session
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-name" className="text-white">Room Name</Label>
                <Input
                  id="room-name"
                  placeholder="Enter room name"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="room-description" className="text-white">Description (Optional)</Label>
                <Textarea
                  id="room-description"
                  placeholder="Enter room description"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-participants" className="text-white">Max Participants</Label>
                <Input
                  id="max-participants"
                  type="number"
                  min="2"
                  max="12"
                  value={newRoom.maxParticipants}
                  onChange={(e) => setNewRoom(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  Create Room
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card 
            key={room.id} 
            className={`bg-black/20 backdrop-blur-lg border-white/10 transition-all duration-300 hover:bg-black/30 ${
              activeRoom?.id === room.id ? 'ring-2 ring-purple-500' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">{room.name}</CardTitle>
                <Badge 
                  className={
                    room.status === 'active' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-white'
                  }
                >
                  {room.status}
                </Badge>
              </div>
              {room.description && (
                <CardDescription className="text-purple-200">
                  {room.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-200" />
                  <span className="text-white text-sm">
                    {room.participants?.length || 0} / {room.maxParticipants}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-200 text-sm">Code:</span>
                  <Badge 
                    variant="outline" 
                    className="font-mono text-white border-white/20 cursor-pointer"
                    onClick={() => copyRoomCode(room.inviteCode)}
                  >
                    {room.inviteCode}
                  </Badge>
                </div>
              </div>
              
              <div className="text-xs text-purple-200">
                Created: {new Date(room.createdAt).toLocaleDateString()}
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={activeRoom?.id === room.id ? "default" : "outline"}
                  onClick={() => setActiveRoom(room)}
                  className="flex-1"
                >
                  {activeRoom?.id === room.id ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Active
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Select
                    </>
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyInviteLink(room.inviteCode)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {rooms.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No rooms created yet</h3>
          <p className="text-purple-200 mb-4">Create your first virtual studio room to get started</p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Room
          </Button>
        </div>
      )}
    </div>
  );
};

export default RoomManager;