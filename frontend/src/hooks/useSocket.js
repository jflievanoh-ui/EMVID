"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "./use-toast";

const listeners = [];
let memoryState = {
  connected: false,
  rooms: {}, // roomId: { offers: [], answers: [], iceCandidates: [] }
};

let socket = null;

function dispatch(stateUpdate) {
  memoryState = { ...memoryState, ...stateUpdate };
  listeners.forEach((listener) => listener(memoryState));
}

function initSocket() {
  if (socket) return; // Ya inicializado

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  socket = io(BACKEND_URL, {
    path: "/socket.io",
    transports: ["websocket"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    dispatch({ connected: true });
    toast({ title: "Conectado al servidor" });
  });

  socket.on("disconnect", () => {
    dispatch({ connected: false });
    toast({ title: "Desconectado del servidor", description: "Intentando reconectar..." });
  });

  // Manejo de eventos genéricos
  socket.on("offer", (data) => {
    const { room_id } = data;
    memoryState.rooms[room_id] = memoryState.rooms[room_id] || { offers: [], answers: [], iceCandidates: [] };
    memoryState.rooms[room_id].offers.push(data);
    dispatch({ rooms: memoryState.rooms });
    toast({ title: `Nueva oferta en room ${room_id}` });
  });

  socket.on("answer", (data) => {
    const { room_id } = data;
    memoryState.rooms[room_id] = memoryState.rooms[room_id] || { offers: [], answers: [], iceCandidates: [] };
    memoryState.rooms[room_id].answers.push(data);
    dispatch({ rooms: memoryState.rooms });
    toast({ title: `Respuesta recibida en room ${room_id}` });
  });

  socket.on("ice-candidate", (data) => {
    const { room_id } = data;
    memoryState.rooms[room_id] = memoryState.rooms[room_id] || { offers: [], answers: [], iceCandidates: [] };
    memoryState.rooms[room_id].iceCandidates.push(data);
    dispatch({ rooms: memoryState.rooms });
  });
}

// Funciones para emitir eventos
export const joinRoom = (roomId) => {
  socket?.emit("join_room", { room_id: roomId });
  toast({ title: `Unido a la room ${roomId}` });
};

export const sendOffer = (data) => socket?.emit("offer", data);
export const sendAnswer = (data) => socket?.emit("answer", data);
export const sendIceCandidate = (data) => socket?.emit("ice-candidate", data);

export function useSocket() {
  const [state, setState] = useState(memoryState);

  useEffect(() => {
    initSocket();
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    ...state,
    joinRoom,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    socket,
  };
}
