import { useCallback, useEffect, useState } from 'react';
import socketManager from '@services/socketManager';
import { getAccessToken } from '@utils/tokenUtils';

export const useSocket = ({ autoConnect = true } = {}) => {
  const [snapshot, setSnapshot] = useState(socketManager.getSnapshot());
  const hasExplicitSocketUrl = Boolean(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_WS_URL);

  useEffect(() => {
    const unsubscribe = socketManager.subscribe(setSnapshot);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!autoConnect) return;
    if (!hasExplicitSocketUrl) return;
    const token = getAccessToken();
    if (!token) return;
    socketManager.connect(token);
  }, [autoConnect, hasExplicitSocketUrl]);

  const connect = useCallback(() => {
    if (!hasExplicitSocketUrl) return;
    const token = getAccessToken();
    if (!token) return;
    socketManager.connect(token);
  }, [hasExplicitSocketUrl]);

  const disconnect = useCallback(() => {
    socketManager.disconnect();
  }, []);

  const on = useCallback((event, handler) => socketManager.on(event, handler), []);
  const emit = useCallback((event, payload) => socketManager.emit(event, payload), []);

  return {
    status: snapshot.status,
    reconnectAttempt: snapshot.reconnectAttempt,
    connected: snapshot.status === 'connected',
    reconnecting: snapshot.status === 'reconnecting',
    disconnected: snapshot.status === 'disconnected',
    connect,
    disconnect,
    on,
    emit,
  };
};

export default useSocket;
