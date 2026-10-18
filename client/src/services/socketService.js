import { io } from 'socket.io-client';

let socketInstance = null;

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  // In production without a dedicated WebSocket server, disable real-time socket connections
  // to avoid polling errors on serverless infrastructure. REST chat fallback handles all messaging.
  if (import.meta.env.PROD) {
    return null;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

const stubSocket = {
  connected: false,
  on: () => {},
  off: () => {},
  emit: () => {},
  disconnect: () => {},
};

/**
 * Returns an authenticated Socket.IO client instance.
 * Reuses existing connection if already established.
 * In production without VITE_SOCKET_URL, returns a stub instance.
 * @param {string} token  - JWT Bearer token from localStorage
 */
export const getSocket = (token) => {
  if (!SOCKET_URL) {
    return stubSocket;
  }

  if (socketInstance && socketInstance.connected) return socketInstance;

  // Disconnect stale instance if any
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  socketInstance = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  return socketInstance;
};

/**
 * Disconnect and clear the shared socket instance.
 * Should be called on logout.
 */
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export default getSocket;
