import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

const serverUrl = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:4000';

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(serverUrl, { transports: ['websocket'] });
  }
  return socket;
};
