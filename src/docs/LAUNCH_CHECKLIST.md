# Launch Readiness & Post-Launch Checklist

## Pre-launch QA (core user flows)

- [ ] Landing → Sign Up CTA → Register → Login → Dashboard renders
- [ ] Dashboard: filters (priority/source/date), alert detail modal, mark read/dismiss, toasts
- [ ] Alert History: search, filters, pagination, Export CSV
- [ ] Settings: change password (success + error cases), notifications (channels + quiet hours), watchlist add/remove
- [ ] Admin (if enabled): navigation visibility and role-gated access

## Responsiveness & devices

- [ ] Breakpoints: 360px, 768px, 1024px, 1280px, 1440px
- [ ] Mobile nav drawer opens/closes; links navigate correctly
- [ ] Touch targets ≥44px; no horizontal scrollbars
- [ ] Test on: Chrome/Edge (Windows), Safari (iOS), Chrome (Android), Firefox (desktop)

## Links & navigation

- [ ] Header/footers links resolve (Landing anchors, Docs, Support)
- [ ] In-app nav routes: Landing, Login, Register, Dashboard, Alert History, Settings, Admin
- [ ] External links open in new tab where appropriate

## Forms & validation

- [ ] Registration/Login: required fields, error states, loading/disabled buttons
- [ ] Watchlist: uppercase 2–10 chars validation
- [ ] Password change: incorrect current password, weak password, rate limit, offline
- [ ] Feedback/dismiss actions show toasts

## Landing page launch prep

- [ ] Primary CTA text: "Sign Up" (or trial copy) visible above the fold
- [ ] Replace placeholder hero with dashboard screenshot
- [ ] Add 3-shot gallery (Dashboard, Alert History, Settings) + 1 GIF in "How it works"
- [ ] Social previews: OG/Twitter images present

## Onboarding flow smoothness

- [ ] Post-register redirect to Dashboard (or onboarding stepper)
- [ ] First-time tooltip/help link to Getting Started
- [ ] Quiet hours + channel toggles surfaced in Settings

## Post-launch monitoring

- [ ] Analytics events: page views, sign up, login, alert detail open, export CSV, settings saves
- [ ] Error/exception logging enabled (frontend)
- [ ] Feedback channel monitored (support email/Slack)
- [ ] Track churn signals: repeated login failures, zero-alert sessions

## Quick bugfix protocol

- [ ] Reproduce on latest build; capture console/network errors
- [ ] Patch, run `npm test` (or targeted tests), and quick manual smoke (login, dashboard, alert detail)
- [ ] Ship hotfix; update changelog/release note
