import { useEffect, useRef, useCallback, useState } from 'react';
import io from 'socket.io-client';
import { WS_URL, ACCESS_TOKEN_KEY, RECONNECT_INTERVAL, RECONNECT_MAX_ATTEMPTS, WS_EVENTS } from '@utils/constants';
import { getLocalStorage } from '@utils/helpers';

export const useWebSocket = (enabled = true) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const listenersRef = useRef({});

  useEffect(() => {
    if (!enabled) return;

    const token = getLocalStorage(ACCESS_TOKEN_KEY);
    if (!token) return;

    // Initialize socket connection
    socketRef.current = io(WS_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: RECONNECT_INTERVAL,
      reconnectionDelayMax: RECONNECT_INTERVAL * 5,
      reconnectionAttempts: RECONNECT_MAX_ATTEMPTS,
      transports: ['websocket', 'polling'],
    });

    // Connection handlers
    socketRef.current.on(WS_EVENTS.CONNECT, () => {
      console.log('WebSocket connected');
      setConnected(true);
      setReconnectAttempts(0);
    });

    socketRef.current.on(WS_EVENTS.DISCONNECT, () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    socketRef.current.on('reconnect_attempt', () => {
      setReconnectAttempts((prev) => prev + 1);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [enabled]);

  const on = useCallback((event, callback) => {
    if (!socketRef.current) return;

    if (!listenersRef.current[event]) {
      listenersRef.current[event] = [];
    }

    listenersRef.current[event].push(callback);
    socketRef.current.on(event, callback);

    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  }, []);

  const emit = useCallback((event, data) => {
    if (!socketRef.current?.connected) {
      console.warn('WebSocket not connected');
      return false;
    }
    socketRef.current.emit(event, data);
    return true;
  }, []);

  const off = useCallback((event, callback) => {
    if (!socketRef.current) return;
    socketRef.current.off(event, callback);
  }, []);

  return {
    socket: socketRef.current,
    connected,
    reconnectAttempts,
    on,
    emit,
    off,
  };
};

export default useWebSocket;
