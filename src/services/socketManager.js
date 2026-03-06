import { io } from 'socket.io-client';
import { WS_URL, WS_EVENTS } from '@utils/constants';

class SocketManager {
  constructor() {
    this.socket = null;
    this.status = 'disconnected';
    this.attempt = 0;
    this.listeners = new Set();
    this.bound = false;
  }

  notify() {
    const snapshot = { status: this.status, reconnectAttempt: this.attempt };
    this.listeners.forEach((listener) => listener(snapshot));
  }

  bindLifecycleEvents() {
    if (!this.socket || this.bound) return;

    this.socket.on(WS_EVENTS.CONNECT, () => {
      this.status = 'connected';
      this.attempt = 0;
      this.notify();
    });

    this.socket.on(WS_EVENTS.DISCONNECT, () => {
      this.status = 'disconnected';
      this.notify();
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.status = 'reconnecting';
      this.attempt = attemptNumber ?? this.attempt + 1;
      this.notify();
    });

    this.socket.on('connect_error', () => {
      if (this.status !== 'connected') {
        this.status = 'reconnecting';
        this.notify();
      }
    });

    this.socket.on('reconnect_failed', () => {
      this.status = 'disconnected';
      this.attempt = 0;
      this.notify();
    });

    this.bound = true;
  }

  connect(token) {
    if (!token) return null;

    if (this.socket?.connected) return this.socket;

    if (!this.socket) {
      this.socket = io(WS_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 8000,
        randomizationFactor: 0.5,
      });
      this.status = 'reconnecting';
      this.notify();
      this.bindLifecycleEvents();
      return this.socket;
    }

    this.socket.auth = { token };
    this.socket.connect();
    this.status = 'reconnecting';
    this.notify();
    this.bindLifecycleEvents();
    return this.socket;
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.status = 'disconnected';
    this.attempt = 0;
    this.notify();
  }

  on(event, callback) {
    if (!this.socket) return () => {};
    this.socket.on(event, callback);
    return () => {
      this.socket?.off(event, callback);
    };
  }

  emit(event, payload) {
    if (!this.socket?.connected) return false;
    this.socket.emit(event, payload);
    return true;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener({ status: this.status, reconnectAttempt: this.attempt });
    return () => this.listeners.delete(listener);
  }

  getSnapshot() {
    return { status: this.status, reconnectAttempt: this.attempt };
  }
}

const socketManager = new SocketManager();

export default socketManager;
