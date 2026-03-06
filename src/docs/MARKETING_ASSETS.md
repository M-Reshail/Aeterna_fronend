# Marketing Assets & Media Plan

This file lists the assets to capture and how to present them. No binary assets are committed—use these specs when capturing real media.

## Screenshot shot list (desktop + mobile)

1. **Dashboard – Live feed**: High-priority alerts visible, filter badge active, tooltip showing on hover.
2. **Alert detail modal**: Open detail with priority badge, source tags, and action buttons.
3. **Alert History**: Filters applied, export button visible, search bar focused.
4. **Settings – Notifications**: Quiet hours + channel toggles visible.
5. **Settings – Watchlist**: At least 3 tokens added; validation hint visible.
6. **Landing hero**: CTA buttons visible, testimonial or metric card in frame.

Guidelines: use 1440×900 for desktop, 390×844 for mobile; light blur sensitive data; keep consistent brand colors.

## Feature demo GIFs

- **Live alert flow (8–12s)**: Receive alert → open detail → mark read → toast.
- **Filters workflow (6–8s)**: Open filter sidebar → toggle priorities → results update.
- **Export workflow (6–8s)**: Run a search → click Export CSV → toast success.
- **Settings workflow (8–10s)**: Toggle quiet hours → add watchlist token → save password (with success toast).

Record at 30fps, 1x scale; limit GIF width to 1280px; keep file size <8MB.

## Social preview images

- **OpenGraph (OG)**: 1200×630; include logo, product tagline, and dashboard hero.
- **Twitter/X card**: 1200×675; same composition, slightly tighter crop.
- **LinkedIn**: 1200×627; reuse OG with center-safe text.

Include brand colors (#3B82F6 primary, #10B981 accent) and a dark background. Place CTA text on the right; logo top-left.

## Landing page updates (assets)

- Replace placeholder hero images with the dashboard hero screenshot.
- Add one feature GIF in the “How it works” section.
- Add 3 static screenshots in a gallery: Dashboard, Alert History, Settings.

## Capture workflow

1. Run `npm run dev`, seed demo data if needed.
2. Use Chrome at 100% zoom; hide bookmarks bar.
3. Set system font rendering to default; disable extensions that alter UI.
4. Capture via built-in OS tool or Chrome DevTools (Device Mode for mobile shots).
5. Export to PNG (screenshots) and MP4→GIF (via ffmpeg + gifski) for animations.

## File naming convention

- Screenshots: `aeterna-{page}-{state}-{device}.png`
- GIFs: `aeterna-{flow}.gif`
- Social previews: `aeterna-og.png`, `aeterna-twitter.png`

## Delivery

Store produced assets under `public/marketing/` with the names above. Avoid committing large binaries if the repo size is constrained; coordinate with release packaging instead.
