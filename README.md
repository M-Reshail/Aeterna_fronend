# AETERNA Frontend - React 18 + Vite

A modern, responsive web dashboard for real-time cryptocurrency alert monitoring. Built with React 18, TailwindCSS, and Socket.io for real-time updates.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- Modern web browser

### Installation

1. **Clone the repository**

```bash
cd aeterna
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**
   Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=http://localhost:8000/socket.io
VITE_APP_NAME=AETERNA
VITE_APP_VERSION=1.0.0
```

4. **Start development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components (Button, Input, Card, etc.)
│   ├── layout/          # Layout components (Header, Footer)
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard specific components
│   └── settings/        # Settings specific components
├── pages/               # Full page components
│   ├── Landing.jsx      # Landing page
│   ├── Login.jsx        # Login page
│   ├── Register.jsx     # Registration page
│   ├── Dashboard.jsx    # Main dashboard
│   ├── AlertHistory.jsx # Alert history page
│   ├── Settings.jsx     # Settings page
│   └── NotFound.jsx     # 404 page
├── hooks/               # Custom React hooks
│   ├── useAuth.js       # Authentication hook
│   ├── useWebSocket.js  # WebSocket connection hook
│   ├── useToast.js      # Toast notifications hook
│   └── usePreferences.js
├── services/            # API service layer
│   ├── api.js           # Axios instance with interceptors
│   ├── authService.js   # Authentication API
│   ├── alertsService.js # Alerts API
│   ├── userService.js   # User preferences API
│   └── metricsService.js # Admin metrics API
├── contexts/            # React Context for state management
│   ├── AuthContext.jsx  # Authentication context
│   ├── AlertContext.jsx # Alerts state
│   └── PreferencesContext.jsx
├── utils/               # Utility functions
│   ├── constants.js     # App constants
│   ├── helpers.js       # Helper functions
│   └── formatters.js    # Formatting utilities
├── styles/              # Global CSS
│   └── globals.css      # TailwindCSS + custom styles
├── App.jsx              # Root component
└── main.jsx             # Entry point
```

## 🎨 Design System

### Color Palette

- **Primary**: `#3B82F6` (Blue)
- **Success**: `#10B981` (Green)
- **Danger**: `#EF4444` (Red)
- **Warning**: `#F59E0B` (Amber)
- **Dark**: `#0F172A` to `#1E293B`

### Typography

- **Font**: Inter (Google Fonts)
- **Sizes**: H1 (2.5rem), H2 (2rem), Body (1rem), Small (0.875rem)

### Components

All components use TailwindCSS for styling and support:

- Dark mode by default
- Responsive design (mobile-first)
- Accessibility features (ARIA labels, semantic HTML)
- Loading and disabled states

## 📚 Available Pages

### Public Pages

- **Landing** (`/`) - Home page with features and pricing
- **Login** (`/login`) - User login
- **Register** (`/register`) - New user registration

### Protected Pages (requires authentication)

- **Dashboard** (`/dashboard`) - Main alert dashboard
- **Alerts** (`/alerts`) - Alert history and search
- **Settings** (`/settings`) - User preferences and account management

## 🔧 Key Features

### Authentication

- Email/password registration and login
- JWT token-based authentication
- Automatic token refresh
- Protected route wrapper
- Auto-redirect for unauthenticated users

### Real-time Features

- WebSocket integration with Socket.io
- Automatic reconnection logic
- Real-time alert notifications
- Connection status indicator

### Dashboard

- Alert feed with filtering
- Priority levels (HIGH, MEDIUM, LOW)
- Alert detail view
- Mark as read / Dismiss
- Search functionality

### Settings

- Account management
- Password change
- Notification preferences
- Quiet hours configuration
- Token watchlist management
- Alert frequency selection

### API Integration

- Axios instance with interceptors
- JWT token management
- Error handling with retry logic
- Request/response logging

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## 🏗️ Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` directory.

## 📦 Dependencies

### Core

- **react** (18.2+) - UI library
- **react-dom** - React DOM renderer
- **react-router-dom** - Client-side routing

### State Management

- **@tanstack/react-query** - Server state management
- **react** Context API - Client state management

### HTTP & WebSocket

- **axios** - HTTP client
- **socket.io-client** - WebSocket client

### Styling

- **tailwindcss** - Utility-first CSS
- **postcss** - CSS processing

### Development

- **vite** - Next generation bundler
- **@vitejs/plugin-react** - React plugin for Vite
- **jest** - Testing framework
- **@testing-library/react** - React testing utilities

## 🔐 Security Features

- JWT token storage in localStorage
- Automatic token refresh on 401
- Protected routes with authentication check
- XSS prevention with React's built-in escaping
- CSRF protection (via backend)
- Secure password validation (8+ chars, uppercase, lowercase, number, special char)

## 🔄 API Integration

The frontend communicates with the backend API at `http://localhost:8000` (configurable via `.env`).

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/profile` - Get user profile
- `PATCH /api/auth/profile` - Update profile
- `POST /api/auth/password-change` - Change password
- `DELETE /api/auth/account` - Delete account

### Alerts Endpoints

- `GET /api/alerts` - List alerts
- `GET /api/alerts/:id` - Alert details
- `PATCH /api/alerts/:id` - Mark as read
- `DELETE /api/alerts/:id` - Dismiss alert
- `GET /api/alerts/history` - Alert history
- `GET /api/alerts/search` - Search alerts

### User Preferences

- `GET /api/users/preferences` - Get preferences
- `PATCH /api/users/preferences` - Update preferences
- `GET /api/users/notification-settings` - Get notification settings
- `PATCH /api/users/notification-settings` - Update settings
- `POST /api/users/watchlist` - Add to watchlist
- `DELETE /api/users/watchlist/:token` - Remove from watchlist

## 🚨 Error Handling

Error handling is implemented at multiple levels:

1. **API Interceptors** - Automatic token refresh on 401
2. **Service Layer** - Consistent error formatting
3. **Component Level** - User-friendly error messages
4. **Toast Notifications** - Non-intrusive error/success feedback

## 📱 Responsive Design

The app is fully responsive with breakpoints for:

- Mobile (320px)
- Tablet (768px)
- Desktop (1024px)
- Wide (1280px)

## 🎯 Performance Optimizations

- Code splitting with React Router
- Lazy loading for route components
- Image optimization
- Bundle size monitoring
- Lighthouse score target: >80

## 📊 Analytics & Monitoring

- Google Analytics / Plausible integration ready
- User journey tracking
- Error rate monitoring
- Performance metrics collection

## 🐛 Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure the backend is running on `http://localhost:8000` and has proper CORS configuration.

### WebSocket Connection Fails

Check that the WebSocket URL is correct in `.env` and the backend WebSocket server is running.

### Token Refresh Not Working

Ensure the backend `/api/auth/refresh` endpoint is implemented and returning new tokens.

## 📞 Support

For issues or questions:

1. Check the [FRONTEND_INSTRUCTIONS.md](./FRONTEND_INSTRUCTIONS.md) for detailed guidelines
2. Review API documentation from backend team
3. Check WebSocket integration requirements

## 📄 License

This project is part of the AETERNA MVP and follows the project license.

---

**Version**: 1.0.0  
**Last Updated**: February 19, 2026  
**Status**: MVP Development
