import { useCallback, useEffect, useState } from 'react';
import socketManager from '@services/socketManager';
import { getAccessToken } from '@utils/tokenUtils';

export const useSocket = ({ autoConnect = true } = {}) => {
  const [snapshot, setSnapshot] = useState(socketManager.getSnapshot());

  useEffect(() => {
    const unsubscribe = socketManager.subscribe(setSnapshot);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!autoConnect) return;
    const token = getAccessToken();
    if (!token) return;
    socketManager.connect(token);
  }, [autoConnect]);

  const connect = useCallback(() => {
    const token = getAccessToken();
    if (!token) return;
    socketManager.connect(token);
  }, []);

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
