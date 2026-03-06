# Real-Time Alert Aggregation System

## Overview

The Real-Time Alert Aggregation system is a premium OLED-designed component for monitoring trading signals and market alerts in real-time. It matches the Back Testing Platform aesthetic with a modern, glassmorphic design.

## Features

✨ **Design Features:**
- Premium OLED dark theme with emerald accents
- Glowing emerald border indicator badge
- Real-time pulsing animations
- Glassmorphic effects with blur and transparency
- Gradient confidence bars
- Live status indicators

📊 **Functional Features:**
- Real-time alert streaming (simulated WebSocket)
- Alert type indicators (Buy/Sell with color coding)
- Confidence score display (0-100%)
- Source tracking (Technical, Sentiment, Economics, etc.)
- Unread count badge
- Active/Resolved status tracking
- Auto-scrolling with max height overflow
- Performance metrics sidebar
- Alert settings panel

## Component Structure

### Main Component: `RealtimeAlertAggregation`

```jsx
import RealtimeAlertAggregation from '@components/dashboard/RealtimeAlertAggregation';

export const Dashboard = () => {
  return (
    <div className="p-6 rounded-xl bg-black-card/40 border border-black-hover/30">
      <RealtimeAlertAggregation />
    </div>
  );
};
```

### Alert Data Structure

```jsx
{
  id: 1,                           // Unique identifier
  type: 'buy' | 'sell',           // Signal type
  symbol: 'EURUSD',               // Trading pair
  price: 1.0892,                  // Current price
  source: 'Technical Analysis',   // Alert source
  timestamp: Date,                // When alert was created
  status: 'active' | 'resolved',  // Current status
  confidence: 94,                 // Confidence score (0-100)
}
```

## Custom Hook: `useRealtimeAlerts`

For advanced alert management in your components:

```jsx
import { useRealtimeAlerts } from '@hooks/useRealtimeAlerts';

export const MyComponent = () => {
  const {
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
  } = useRealtimeAlerts();

  // Get only buy signals with high confidence
  const buySignals = getAlertsByType('buy');
  const reliableSignals = getHighConfidenceAlerts(90);

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      <p>Buy Signals: {buySignals.length}</p>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
    </div>
  );
};
```

### Hook Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `markAsRead()` | Mark all alerts as read | void |
| `dismissAlert(alertId)` | Remove specific alert | void |
| `resolveAlert(alertId)` | Mark alert as resolved | void |
| `clearAll()` | Remove all alerts | void |
| `getAlertsByType(type)` | Filter by buy/sell | Alert[] |
| `getActiveAlerts()` | Get non-resolved alerts | Alert[] |
| `getHighConfidenceAlerts(threshold)` | Filter by confidence score | Alert[] |

## Styling Classes

### Color System

- **Buy Signals:** `bg-emerald-500`, `text-emerald-400`
- **Sell Signals:** `bg-red-500`, `text-red-400`
- **Active Indicator:** Pulsing dot with `animate-pulse`
- **Resolved Status:** Checkmark with muted color

### Key CSS Classes

```css
/* Container */
.bg-black-card       /* #1A1A1A - Card background */
.bg-black-oled       /* #000000 - Deep black */
.border-black-hover  /* #2C2C2C - Hover border */

/* Text */
.text-white-primary  /* #FFFFFF */
.text-white-muted    /* #8E8E93 */
.text-emerald-400    /* #10b981 */

/* Effects */
.backdrop-blur-sm    /* Glassmorphic blur */
.shadow-glow         /* Glowing shadow effect */
.animate-pulse       /* Pulsing animation */
```

## Integration Examples

### Example 1: Add to Landing Page

```jsx
import RealtimeAlertAggregation from '@components/dashboard/RealtimeAlertAggregation';

export const Landing = () => {
  return (
    <section className="py-16">
      <h2>Live Trading Alerts</h2>
      <div className="max-w-4xl mx-auto p-6 rounded-xl bg-black-card/40">
        <RealtimeAlertAggregation />
      </div>
    </section>
  );
};
```

### Example 2: Custom Dashboard with Hook

```jsx
import { useRealtimeAlerts } from '@hooks/useRealtimeAlerts';

export const CustomDashboard = () => {
  const { 
    alerts, 
    unreadCount, 
    getHighConfidenceAlerts,
    dismissAlert 
  } = useRealtimeAlerts();

  const reliableAlerts = getHighConfidenceAlerts(90);

  return (
    <div className="space-y-4">
      <div className="text-sm text-white-muted">
        {unreadCount} unread • {reliableAlerts.length} high confidence
      </div>
      
      {reliableAlerts.map((alert) => (
        <div key={alert.id} className="p-3 border border-emerald-500/30 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-bold">{alert.symbol}</span>
            <button onClick={() => dismissAlert(alert.id)}>✕</button>
          </div>
          <p className="text-sm text-white-muted">{alert.source}</p>
        </div>
      ))}
    </div>
  );
};
```

### Example 3: Real-Time Monitoring Widget

```jsx
import RealtimeAlertAggregation from '@components/dashboard/RealtimeAlertAggregation';

export const MonitoringWidget = () => {
  return (
    <div className="fixed bottom-6 right-6 w-96 max-h-96">
      <div className="rounded-xl bg-black-card/80 border border-emerald-500/30 backdrop-blur-md p-4">
        <RealtimeAlertAggregation />
      </div>
    </div>
  );
};
```

## Animation Features

### Built-in Animations

1. **Pulsing Lightning Icon**
   - Indicates real-time connection status

2. **Live Status Dot**
   - Red pulsing dot for active alerts
   - Green checkmark for resolved

3. **Hover Effects**
   - Border changes from `black-hover/50` to `emerald-500/30`
   - Shadow glow appears
   - Smooth transition (300ms)

4. **Confidence Bar**
   - Gradient fill from `emerald-500` to `emerald-400`
   - Width scales with confidence percentage

## Performance Optimization

- **Max Visible Alerts:** 20 (others scroll)
- **Auto-Update Interval:** 8 seconds (simulated)
- **Memory Efficient:** Alerts limited to last 20
- **Smooth Scrolling:** CSS overflow with custom scrollbar

## Customization

### Modify Alert Interval

Edit `RealtimeAlertAggregation.jsx`:

```jsx
// Change from 8000ms to your desired interval
}, 8000);
```

### Add Custom Sources

Update the sources array:

```jsx
const sources = [
  'Technical Analysis',
  'Your Custom Source',
  'Machine Learning',
];
```

### Change Color Scheme

Replace emerald with your color:
- `emerald-500` → `blue-500`
- `emerald-400` → `blue-400`
- `emerald-300` → `blue-300`

## Browser Support

- Modern browsers with ES6+ support
- Tailwind CSS 3.3+
- React 18.2+
- Lucide React icons

## Files Included

1. **Components**
   - `src/components/dashboard/RealtimeAlertAggregation.jsx` - Main component

2. **Hooks**
   - `src/hooks/useRealtimeAlerts.js` - State management hook

3. **Pages**
   - `src/pages/Dashboard.jsx` - Full dashboard integration

## Accessibility

- Icons have semantic meaning
- Color pairs meet WCAG contrast requirements
- Live region updates announced
- Keyboard navigable (future enhancement)

## Future Enhancements

- [ ] WebSocket integration for real backend
- [ ] Filter by symbol
- [ ] Export alert history
- [ ] Sound notifications
- [ ] Email/SMS integration
- [ ] A/B testing different layouts
- [ ] Dark/Light theme toggle
- [ ] Mobile responsive tweaks
- [ ] Analytics tracking
- [ ] Keyboard shortcuts

## Support

For issues or questions, refer to the component source code comments or create an issue in the project repository.

---

**Last Updated:** February 23, 2026
**Component Version:** 1.0.0
