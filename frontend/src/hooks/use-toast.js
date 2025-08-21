"use client";
import * as React from "react";
import { io } from "socket.io-client";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 10000; // 10 segundos para ejemplo

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
  SOCKET_CONNECTED: "SOCKET_CONNECTED",
  SOCKET_DISCONNECTED: "SOCKET_DISCONNECTED",
  SOCKET_EVENT: "SOCKET_EVENT",
};

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const toastTimeouts = new Map();

const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) return;
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};

// ---------------- STATE ----------------
const listeners = [];
let memoryState = {
  toasts: [],
  socket: null,
  connected: false,
  rooms: {},
};

// ---------------- DISPATCH ----------------
function reducer(state, action) {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };
    case "DISMISS_TOAST":
      if (action.toastId) addToRemoveQueue(action.toastId);
      else state.toasts.forEach((toast) => addToRemoveQueue(toast.id));
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId || action.toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: action.toastId
          ? state.toasts.filter((t) => t.id !== action.toastId)
          : [],
      };
    case "SOCKET_CONNECTED":
      return { ...state, connected: true };
    case "SOCKET_DISCONNECTED":
      return { ...state, connected: false };
    case "SOCKET_EVENT": {
      const { room_id, type, data } = action.event;
      const rooms = { ...state.rooms };
      rooms[room_id] = rooms[room_id] || { offers: [], answers: [], iceCandidates: [] };
      if (type === "offer") rooms[room_id].offers.push(data);
      if (type === "answer") rooms[room_id].answers.push(data);
      if (type === "ice-candidate") rooms[room_id].iceCandidates.push(data);

      // Opcional: generar toast al recibir evento
      toast({ title: `Evento ${type}`, description: `Recibido en room ${room_id}` });

      return { ...state, rooms };
    }
    default:
      return state;
  }
}

function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

// ---------------- TOAST ----------------
function toast(props) {
  const id = genId();
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  const update = (props) => dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } });

  dispatch({
    type: "ADD_TOAST",
    toast: { ...props, id, open: true, onOpenChange: (open) => { if (!open) dismiss(); } },
  });

  return { id, dismiss, update };
}

// ---------------- SOCKET.IO ----------------
function initSocket() {
  if (memoryState.socket) return;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const socket = io(BACKEND_URL, {
    path: "/socket.io",
    transports: ["websocket"],
    autoConnect: true,
  });

  socket.on("connect", () => dispatch({ type: "SOCKET_CONNECTED" }));
  socket.on("disconnect", () => dispatch({ type: "SOCKET_DISCONNECTED" }));

  ["offer", "answer", "ice-candidate"].forEach((eventType) =>
    socket.on(eventType, (data) => dispatch({ type: "SOCKET_EVENT", event: { room_id: data.room_id, type: eventType, data } }))
  );

  memoryState.socket = socket;
}

// ---------------- HOOK ----------------
function useToast() {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    initSocket();
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const joinRoom = (roomId) => memoryState.socket?.emit("join_room", { room_id: roomId });
  const sendOffer = (data) => memoryState.socket?.emit("offer", data);
  const sendAnswer = (data) => memoryState.socket?.emit("answer", data);
  const sendIceCandidate = (data) => memoryState.socket?.emit("ice-candidate", data);

  return { ...state, toast, dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }), joinRoom, sendOffer, sendAnswer, sendIceCandidate };
}

export { useToast, toast };
