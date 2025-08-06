import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DirectorDashboard from "./components/DirectorDashboard";
import EnhancedParticipantRoom from "./components/EnhancedParticipantRoom";
import AuthPage from "./components/AuthPage";
import { AuthProvider } from "./contexts/AuthContext";
import { StudioProvider } from "./contexts/StudioContext";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <StudioProvider>
            <Routes>
              <Route path="/" element={<AuthPage />} />
              <Route path="/director" element={<DirectorDashboard />} />
              <Route path="/room/:roomId" element={<ParticipantRoom />} />
            </Routes>
            <Toaster />
          </StudioProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;