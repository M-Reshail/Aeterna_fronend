# AETERNA Feature Documentation

## Core capabilities

- **Real-time alert aggregation**: 50+ sources across chains, DEX/CEX, and social feeds.
- **AI-powered filtering**: Noise reduction, priority scoring, and rules-based filtering.
- **Multi-channel notifications**: Email, Telegram, and in-app dashboard.
- **Watchlist targeting**: Focused symbols for higher-signal alerts.
- **Quiet hours & frequency**: Pause or throttle notifications during set windows.
- **Alert history & search**: Backfill, filter, and audit past alerts.

## Dashboard

- **Live feed** with priority badges and statuses (new, read, dismissed).
- **Filters** by priority, date range, and source (via sidebar).
- **Actions**: Mark read, dismiss, and open detail modal.

## Alert History

- **Search & filter** past alerts; refresh to fetch latest.
- **Pagination** and bulk actions for larger sets.

## Settings

- **Account**: Email display, password change, logout.
- **Notifications**: Toggle channels, quiet hours, and alert frequency.
- **Preferences**: Priority filter defaults, watchlist management, and alert options.

## Admin (if enabled)

- Access controlled by role; manage higher-level settings and visibility.

## Performance

- Target sub-100ms ingest-to-display under normal load.
- React 18 + Vite + code splitting for fast initial load.

## Accessibility

- Keyboard focus states, aria labels on interactive controls, and tested axe coverage.

## Notes

- Some integrations (e.g., email/Telegram delivery) depend on backend configuration.

## End-to-end user flows

- **Alert triage (desktop)**: Open Dashboard → apply priority/source filters → scan live feed → open detail → mark read/dismiss → toast confirmation.
- **Alert triage (mobile)**: Toggle Filters via mobile drawer → adjust priorities → tap alert → detail modal → close.
- **History audit**: Alert History → search keyword + priority filter → paginate → export CSV → toast success.
- **Notification setup**: Settings → Notifications → enable channels → set quiet hours → save; status reflected immediately in UI state.
- **Watchlist curation**: Settings → Preferences → add uppercase token → validation hint → save; feeds use updated watchlist.
- **Password change**: Settings → Account → enter current + new password → success toast; on error, see contextual message (incorrect, rate limit, offline).
