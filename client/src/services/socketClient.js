import { io } from 'socket.io-client';
let socket = null;
const serverUrl = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:4000';
export const getSocket = () => {
    if (!socket) {
        socket = io(serverUrl, { transports: ['websocket'] });
    }
    return socket;
};
