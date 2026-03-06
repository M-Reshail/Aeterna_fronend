# AETERNA User Guide

## Who this is for

Traders and analysts using AETERNA for real-time alerts, dashboards, and settings.

## Key concepts

- **Alerts**: Real-time events from 50+ sources, filtered by priority and rules.
- **Watchlist**: Tokens or pairs you want tracked with higher sensitivity.
- **Notification channels**: Email, Telegram, and in-app dashboard notifications.
- **Preferences**: Quiet hours, frequency, and priority filters.

## Navigation map

- **Landing**: Marketing overview and primary CTAs to register or watch demo.
- **Login/Register**: Access and account creation.
- **Dashboard**: Live alert stream, aggregation stats, dismiss/read actions.
- **Alert History**: Historical alerts with filters and search.
- **Settings**: Account security, notifications, watchlist, and preferences.
- **Admin**: Admin-only controls (if your role permits).

## Daily workflow

1. **Login** and verify the dashboard is live (no maintenance banner).
2. **Scan Live Alerts** and use priority filters to focus on HIGH/MEDIUM.
3. **Open Alert Detail** to see context; mark as read or dismiss noise.
4. **Adjust Filters** in the sidebar for sources, priorities, and date ranges.
5. **Set Notifications** in Settings → Notifications (email/Telegram) and quiet hours.
6. **Tune Watchlist** in Settings → Preferences; add tokens/pairs you care about.
7. **Review History** in Alert History for audits or backtesting signals.

## Account & security

- Change password in **Settings → Account**.
- Sessions are JWT-based; logout from the header or Settings.
- Quiet hours and notification frequency reduce alert fatigue.

## Troubleshooting

- **No alerts showing**: Check filters; ensure sources/priorities are enabled.
- **Missing notifications**: Verify channels are toggled on and quiet hours are not active.
- **Slow UI**: Refresh; if persistent, clear cache and retry. If server issues, you'll see a toast/error.
- **Auth issues**: Re-login; if locked out, contact support with your registered email.

## Shortcuts & tips

- Use the refresh action in Alert History to refetch quickly.
- Dismiss irrelevant alerts to keep streams clean.
- Keep watchlist lean (high-signal assets) for sharper filtering.
