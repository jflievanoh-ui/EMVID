import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../components/config";

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
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();

      setUser(data.user);
      localStorage.setItem("virtualStudioUser", JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("virtualStudioUser");
    // Si tu backend necesita cerrar sesión, podrías hacer fetch(`${API_URL}/auth/logout`)
  };

  const joinRoom = async (roomId) => {
    if (!user) throw new Error("User not logged in");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/rooms/${roomId}/join`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) throw new Error("Join room failed");
      const participant = await res.json();

      setUser(participant);
      localStorage.setItem("virtualStudioUser", JSON.stringify(participant));
      return participant;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = { user, login, logout, joinRoom, isLoading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
