import { io, Socket } from 'socket.io-client';
import { getBackendUrl, getAuthToken } from './api';
import type { CommitEvent } from '../types';

let socket: Socket | null = null;

export type CommitHandler = (data: CommitEvent) => void;

export function getOrCreateSocket(): Socket | null {
  const token = getAuthToken();
  if (!token) return null;

  if (socket && socket.connected) return socket;
  if (socket) return socket;

  socket = io(getBackendUrl(), {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  socket.on('connect', () => {
    console.log('[CommitQuest] Socket connected');
  });

  socket.on('connect_error', (err) => {
    console.error('[CommitQuest] Socket connection error:', err.message);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
