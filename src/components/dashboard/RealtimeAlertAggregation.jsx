import React, { useState, useEffect } from 'react';
import { Zap, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, Clock } from 'lucide-react';

export const RealtimeAlertAggregation = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'buy',
      symbol: 'EURUSD',
      price: 1.0892,
      source: 'Technical Analysis',
      timestamp: new Date(Date.now() - 2 * 60000),
      status: 'active',
      confidence: 94,
    },
    {
      id: 2,
      type: 'sell',
      symbol: 'GBPUSD',
      price: 1.2645,
      source: 'Market Sentiment',
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'active',
      confidence: 87,
    },
    {
      id: 3,
      type: 'buy',
      symbol: 'USDJPY',
      price: 149.45,
      source: 'Economic Data',
      timestamp: new Date(Date.now() - 12 * 60000),
      status: 'resolved',
      confidence: 91,
    },
  ]);

  const [unreadCount, setUnreadCount] = useState(2);

  // Simulate real-time alerts
  useEffect(() => {
    const interval = setInterval(() => {
      const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'NZDUSD'];
      const sources = ['Technical Analysis', 'Market Sentiment', 'Economic Data', 'Price Action'];
      const types = ['buy', 'sell'];

      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      const randomConfidence = 85 + Math.floor(Math.random() * 15);

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

      setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]);
      setUnreadCount((prev) => prev + 1);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <div className="w-full h-full">
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative px-6 py-2.5 rounded-full border-2 border-emerald-500/50 bg-black-oled/80 backdrop-blur-xl shadow-lg hover:border-emerald-400/80 hover:shadow-emerald-500/20 transition-all duration-300">
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-xl"></div>
            
            <div className="relative flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-white-primary tracking-tight">
                Real-Time Alert Aggregation
              </span>
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={markAsRead}
          className="px-3 py-1.5 text-xs text-white-muted hover:text-emerald-300 transition-colors duration-200"
        >
          Mark all as read
        </button>
      </div>

      {/* Alerts Container */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="group relative p-4 rounded-lg bg-black-card/60 border border-black-hover/50 hover:border-emerald-500/30 backdrop-blur-sm transition-all duration-300 hover:shadow-emerald-500/10 hover:shadow-lg"
          >
            {/* Status indicator line */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                alert.type === 'buy' ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            ></div>

            <div className="flex items-start justify-between pl-2">
              <div className="flex items-start gap-3 flex-1">
                {/* Type icon */}
                <div
                  className={`mt-1 p-2 rounded-lg ${
                    alert.type === 'buy'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {alert.type === 'buy' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white-primary">
                      {alert.symbol}
                    </span>
                    <span className="text-xs text-white-muted">
                      {alert.price}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        alert.type === 'buy'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {alert.type.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-white-muted">{alert.source}</p>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-white-muted/60" />
                        <span className="text-xs text-white-muted/70">
                          {formatTime(alert.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Confidence bar */}
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-xs text-white-muted">
                        Confidence: {alert.confidence}%
                      </p>
                      <div className="w-24 h-1.5 bg-black-oled/50 rounded-full overflow-hidden border border-black-hover/30">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                          style={{ width: `${alert.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="ml-2 flex-shrink-0">
                {alert.status === 'active' ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs text-emerald-400 font-medium">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500/50" />
                    <span className="text-xs text-white-muted/60">Done</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {alerts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-8 h-8 text-white-muted/40 mb-3" />
          <p className="text-sm text-white-muted">No alerts at the moment</p>
          <p className="text-xs text-white-muted/60 mt-1">
            Waiting for real-time data...
          </p>
        </div>
      )}

      {/* Live indicator footer */}
      <div className="mt-4 pt-4 border-t border-black-hover/30 flex items-center justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-xs text-emerald-400 font-medium">
          Live aggregation active
        </span>
      </div>
    </div>
  );
};

export default RealtimeAlertAggregation;
