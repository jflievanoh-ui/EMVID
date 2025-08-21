import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const socket = io(BACKEND_URL, {
  path: '/socket.io',
  transports: ['websocket'],
  withCredentials: true,
  autoConnect: false,
});

export const joinRoom = (roomId) => socket.emit('join_room', { room_id: roomId });
export const sendOffer = (data) => socket.emit('offer', data);
export const sendAnswer = (data) => socket.emit('answer', data);
export const sendIceCandidate = (data) => socket.emit('ice-candidate', data);

export const onOffer = (callback) => socket.on('offer', callback);
export const onAnswer = (callback) => socket.on('answer', callback);
export const onIceCandidate = (callback) => socket.on('ice-candidate', callback);
export const onConnect = (callback) => socket.on('connect', callback);
export const onDisconnect = (callback) => socket.on('disconnect', callback);

export const connectSocket = () => socket.connect();
export const disconnectSocket = () => socket.disconnect();

export default socket;
