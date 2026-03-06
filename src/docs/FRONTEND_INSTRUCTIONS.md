# AETERNA Frontend Development Instructions

## Project Overview

AETERNA is a real-time crypto alert platform built with React 18, TailwindCSS, and Socket.io for WebSocket integration. This document outlines the complete frontend development roadmap across 12 weeks.

## Tech Stack

- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **API Client**: Axios
- **State Management**: React Context + React Query
- **WebSocket**: Socket.io-client
- **Testing**: Jest + React Testing Library
- **Charts**: Recharts or Chart.js
- **UI Components**: Custom (TailwindCSS-based)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Button, Input, Card, etc.)
│   ├── layout/         # Layout components (Header, Sidebar, Footer)
│   ├── auth/           # Auth components
│   ├── dashboard/      # Dashboard components
│   └── settings/       # Settings components
├── pages/              # Page-level components
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── AlertHistory.jsx
│   ├── AdminDashboard.jsx
│   ├── Settings.jsx
│   └── NotFound.jsx
├── hooks/              # Custom React hooks
│   ├── useAuth.js
│   ├── useAlerts.js
│   ├── useWebSocket.js
│   └── usePreferences.js
├── services/           # API service layer
│   ├── api.js         # Axios instance & interceptors
│   ├── authService.js
│   ├── alertsService.js
│   ├── userService.js
│   └── metricsService.js
├── contexts/           # React Context
│   ├── AuthContext.jsx
│   ├── AlertContext.jsx
│   └── PreferencesContext.jsx
├── utils/              # Helper functions
│   ├── formatters.js
│   ├── validators.js
│   ├── constants.js
│   └── helpers.js
├── styles/             # CSS utilities & custom styles
│   └── globals.css
├── App.jsx             # Root component
└── main.jsx            # Entry point
```

## Design System

### Color Palette

- **Primary Blue**: `#3B82F6` (Hex) / `rgb(59, 130, 246)`
- **Success Green**: `#10B981` (Hex) / `rgb(16, 185, 129)`
- **Danger Red**: `#EF4444` (Hex) / `rgb(239, 68, 68)`
- **Warning Amber**: `#F59E0B` (Hex) / `rgb(245, 158, 11)`
- **Background Dark**: `#0F172A` / `#1E293B`
- **Surface**: `#1E293B` / `#334155`
- **Text Light**: `#F1F5F9`

### Typography

- **Font Family**: Inter (Google Fonts)
- **Sizes**:
  - H1: 2.5rem (40px)
  - H2: 2rem (32px)
  - H3: 1.5rem (24px)
  - H4: 1.25rem (20px)
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)
  - Tiny: 0.75rem (12px)

### Spacing Scale

- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

## Development Workflow

### Sprint Structure

The project is divided into 6 sprints over 12 weeks:

- **Sprint 1 (Weeks 1-2)**: Setup & Authentication
- **Sprint 2 (Weeks 3-4)**: Dashboard UI & Components
- **Sprint 3 (Weeks 5-6)**: API Integration & Settings
- **Sprint 4 (Weeks 7-8)**: Real-time Features & Admin
- **Sprint 5 (Weeks 9-10)**: Testing & Optimization
- **Sprint 6 (Weeks 11-12)**: Documentation & Launch

### Weekly Deliverables Tracking

Each week should have completed deliverables. Check the main roadmap for specific week-by-week tasks.

## Key Development Rules

### Component Guidelines

1. **Functional Components Only**: Use React functional components with hooks
2. **Props Validation**: Use PropTypes for all components
3. **Accessibility**: Include ARIA labels, semantic HTML, keyboard navigation
4. **Responsive**: Mobile-first approach, test at all breakpoints
5. **Reusability**: Create composable, self-contained components

### Naming Conventions

- Components: PascalCase (e.g., `AlertCard.jsx`)
- Files: PascalCase for components, camelCase for hooks/utils
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- CSS Classes: kebab-case with component prefix

### State Management

- **Local State**: Use `useState` for component-level state
- **Global State**: Use React Context for auth, alerts, preferences
- **API Data**: Use React Query (useQuery/useMutation)
- **WebSocket**: Use custom `useWebSocket` hook

### API Integration

- All API calls go through `services/api.js`
- Use axios instance with interceptors for JWT token handling
- Implement automatic token refresh
- Handle errors consistently with toast notifications

## Installation & Setup

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Format code
npm run format

# Lint code
npm run lint
```

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=http://localhost:8000/socket.io
VITE_APP_NAME=AETERNA
VITE_APP_VERSION=1.0.0
```

## Component Development Checklist

For each component, ensure:

- [ ] Props defined and validated
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Accessibility (ARIA labels, semantic HTML)
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Hover/focus states
- [ ] Unit tests
- [ ] Storybook story (if applicable)

## Authentication Flow

1. User registers → Email verification → Auto-login
2. User logs in → JWT token stored → Redirect to dashboard
3. Protected routes check token → Redirect if invalid
4. Token refresh on 401 response
5. Logout clears token and redirects to login

## API Integration Points

### Auth Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/password-reset`
- `GET /api/auth/profile`
- `PATCH /api/auth/profile`

### Alert Endpoints

- `GET /api/alerts` - List alerts
- `GET /api/alerts/:id` - Alert details
- `GET /api/alerts/history` - History
- `PATCH /api/alerts/:id` - Mark as read
- `DELETE /api/alerts/:id` - Dismiss

### Settings Endpoints

- `GET /api/users/preferences`
- `PATCH /api/users/preferences`
- `POST /api/users/password-change`
- `DELETE /api/users/account`

### Admin Endpoints

- `GET /api/admin/metrics`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`

## WebSocket Events

### Client → Server

- `authenticate` - Send JWT token
- `disconnect` - Clean disconnect

### Server → Client

- `new_alert` - New alert received
- `alert_updated` - Alert status changed
- `connection_status` - Connection established/lost

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

- Components: 70%+ coverage
- Hooks: 80%+ coverage
- Utils: 90%+ coverage
- Services: 85%+ coverage

### Integration Tests

- Authentication flow
- Alert feed functionality
- Settings page interactions
- Dashboard interactions

### E2E Tests (Optional)

- User registration and login
- Viewing alerts in dashboard
- Updating preferences
- Admin dashboard

## Performance Targets

- **Lighthouse Score**: >80
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Time to Interactive**: <3.5s
- **Cumulative Layout Shift**: <0.1
- **Bundle Size**: <200KB (gzipped)

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Common Issues & Solutions

### Issue: Token expires during session

**Solution**: Implement token refresh interceptor in axios

### Issue: WebSocket disconnects

**Solution**: Implement auto-reconnect logic with exponential backoff

### Issue: Performance degradation with large alert lists

**Solution**: Implement virtualization (react-window) for long lists

### Issue: Mobile responsiveness issues

**Solution**: Use mobile-first approach, test at actual breakpoints

## Resources & Documentation Links

- [React 18 Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/)
- [React Router Docs](https://reactrouter.com/)
- [Axios Docs](https://axios-http.com/)
- [Socket.io Client Docs](https://socket.io/docs/v4/client-api/)
- [React Query Docs](https://tanstack.com/query/latest)

## Git Workflow

1. Create feature branch: `git checkout -b feature/component-name`
2. Commit changes: `git commit -m "feat: add component name"`
3. Push to remote: `git push origin feature/component-name`
4. Create Pull Request for review
5. Merge after approval

## Deployment

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

### Docker Build

```bash
docker build -t aeterna-frontend .
docker run -p 3000:3000 aeterna-frontend
```

## Monitoring & Analytics

- Setup Google Analytics or Plausible
- Track user journey (signup → login → dashboard)
- Monitor alert engagement
- Track feature usage
- Monitor error rates and performance metrics

## Version History

- **v1.0.0** (Current) - MVP Frontend Implementation

---

**Last Updated**: February 19, 2026
**Document Version**: 1.0
