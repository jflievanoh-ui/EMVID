import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import { Video, Users, Settings } from "lucide-react";

const AuthPage = () => {
  const { login, joinRoom, isLoading } = useAuth();
  const navigate = useNavigate();
  const [directorForm, setDirectorForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [participantForm, setParticipantForm] = useState({
    name: "",
    roomCode: ""
  });

  const handleDirectorLogin = async (e) => {
    e.preventDefault();
    try {
      await login({ ...directorForm, role: "director" });
      toast.success("Welcome to Virtual Studio!");
      navigate("/director");
    } catch (error) {
      toast.error("Login failed. Please try again.");
    }
  };

  const handleParticipantJoin = async (e) => {
    e.preventDefault();
    try {
      await joinRoom(participantForm.roomCode, participantForm.name);
      toast.success(`Joined room ${participantForm.roomCode}!`);
      navigate(`/room/${participantForm.roomCode}`);
    } catch (error) {
      toast.error("Could not join room. Please check the room code.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-500 p-3 rounded-full">
              <Video className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Virtual Studio</h1>
          <p className="text-purple-200">Professional streaming control center</p>
        </div>

        <Tabs defaultValue="director" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="director" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Director
            </TabsTrigger>
            <TabsTrigger value="participant" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="director">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Director Login</CardTitle>
                <CardDescription className="text-purple-200">
                  Access the master control interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDirectorLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="director-name" className="text-white">Name</Label>
                    <Input
                      id="director-name"
                      placeholder="Enter your name"
                      value={directorForm.name}
                      onChange={(e) => setDirectorForm(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="director-email" className="text-white">Email</Label>
                    <Input
                      id="director-email"
                      type="email"
                      placeholder="Enter your email"
                      value={directorForm.email}
                      onChange={(e) => setDirectorForm(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="director-password" className="text-white">Password</Label>
                    <Input
                      id="director-password"
                      type="password"
                      placeholder="Enter your password"
                      value={directorForm.password}
                      onChange={(e) => setDirectorForm(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Enter Studio"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participant">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Join Room</CardTitle>
                <CardDescription className="text-purple-200">
                  Enter room code to join a session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleParticipantJoin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="participant-name" className="text-white">Your Name</Label>
                    <Input
                      id="participant-name"
                      placeholder="Enter your name"
                      value={participantForm.name}
                      onChange={(e) => setParticipantForm(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="room-code" className="text-white">Room Code</Label>
                    <Input
                      id="room-code"
                      placeholder="Enter room code"
                      value={participantForm.roomCode}
                      onChange={(e) => setParticipantForm(prev => ({ ...prev, roomCode: e.target.value.toUpperCase() }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 font-mono text-center text-lg"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Joining..." : "Join Room"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;