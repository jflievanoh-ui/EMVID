import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth state
    const storedUser = localStorage.getItem("virtualStudioUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      // Mock authentication - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: "user_" + Date.now(),
        name: credentials.name,
        email: credentials.email,
        role: credentials.role || "director",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.name}`
      };
      
      setUser(mockUser);
      localStorage.setItem("virtualStudioUser", JSON.stringify(mockUser));
      return mockUser;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("virtualStudioUser");
  };

  const joinRoom = async (roomId, participantName) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const participant = {
        id: "participant_" + Date.now(),
        name: participantName,
        role: "participant",
        roomId: roomId,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${participantName}`
      };
      
      setUser(participant);
      localStorage.setItem("virtualStudioUser", JSON.stringify(participant));
      return participant;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    joinRoom,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};