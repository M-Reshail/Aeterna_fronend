import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing real-time alert aggregation
 * Simulates real-time alert streaming and provides alert management
 */
export const useRealtimeAlerts = (initialAlerts = []) => {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [unreadCount, setUnreadCount] = useState(
    initialAlerts.filter((a) => a.status === 'active').length
  );
  const [isConnected, setIsConnected] = useState(true);

  // Simulate WebSocket connection for real-time alerts
  useEffect(() => {
    const interval = setInterval(() => {
      const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'NZDUSD', 'CADJPY'];
      const sources = [
        'Technical Analysis',
        'Market Sentiment',
        'Economic Data',
        'Price Action',
        'Volume Analysis',
      ];
      const types = ['buy', 'sell'];

      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      const randomConfidence = 80 + Math.floor(Math.random() * 20);

      const newAlert = {
        id: Date.now(),
        type: randomType,
        symbol: randomSymbol,
        price: (Math.random() * 100 + 100).toFixed(4),
        source: randomSource,
        timestamp: new Date(),
        status: 'active',
        confidence: randomConfidence,
      };

      setAlerts((prev) => [newAlert, ...prev.slice(0, 19)]);
      setUnreadCount((prev) => prev + 1);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const dismissAlert = useCallback((alertId) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);

  const resolveAlert = useCallback((alertId) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, status: 'resolved' } : alert
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setAlerts([]);
    setUnreadCount(0);
  }, []);

  const getAlertsByType = useCallback(
    (type) => {
      return alerts.filter((alert) => alert.type === type);
    },
    [alerts]
  );

  const getActiveAlerts = useCallback(() => {
    return alerts.filter((alert) => alert.status === 'active');
  }, [alerts]);

  const getHighConfidenceAlerts = useCallback(
    (threshold = 85) => {
      return alerts.filter((alert) => alert.confidence >= threshold);
    },
    [alerts]
  );

  return {
    alerts,
    unreadCount,
    isConnected,
    markAsRead,
    dismissAlert,
    resolveAlert,
    clearAll,
    getAlertsByType,
    getActiveAlerts,
    getHighConfidenceAlerts,
  };
};

export default useRealtimeAlerts;
