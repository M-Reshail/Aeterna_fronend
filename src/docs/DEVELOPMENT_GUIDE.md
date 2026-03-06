# AETERNA Frontend - Development Guide

This guide covers everything you need to know to develop and maintain the AETERNA frontend application.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Architecture](#architecture)
4. [Component Development](#component-development)
5. [API Integration](#api-integration)
6. [State Management](#state-management)
7. [Authentication](#authentication)
8. [Real-time Features](#real-time-features)
9. [Testing](#testing)
10. [Performance](#performance)
11. [Deployment](#deployment)

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ (check with `node --version`)
- npm or yarn
- Modern code editor (VS Code recommended)
- Basic knowledge of React, TypeScript basics optional

### Initial Setup

```bash
# 1. Navigate to project directory
cd aeterna

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Update .env with your configuration
# VITE_API_BASE_URL=http://localhost:8000
# VITE_WS_URL=http://localhost:8000/socket.io

# 5. Start development server
npm run dev

# 6. Open browser
# http://localhost:3000
```

## 🔄 Development Workflow

### Daily Development

```bash
# Start development server with hot reload
npm run dev

# In another terminal, run tests in watch mode
npm test -- --watch

# Format code before committing
npm run format

# Check for linting issues
npm run lint
```

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-component

# 2. Make changes and commit regularly
git add .
git commit -m "feat: add new component

- Added NewComponent
- Added corresponding tests
- Updated documentation"

# 3. Push and create PR
git push origin feature/new-component

# 4. After review and approval, merge to main
git checkout main
git pull origin main
git merge feature/new-component
git push origin main
```

### Commit Message Format

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore

Example:

```
feat(dashboard): add alert filter by priority

- Add priority selector component
- Implement filter logic in alert list
- Add tests for filter functionality

Closes #123
```

## 🏗️ Architecture

### Folder Structure Philosophy

- **components/** - Pure UI components, no business logic
- **pages/** - Full page components that tie everything together
- **hooks/** - Custom React hooks for logic reuse
- **services/** - API communication layer
- **contexts/** - Global state management
- **utils/** - Pure functions, constants
- **styles/** - Global styles and utilities

### Data Flow

```
User Action
    ↓
Component (handles UI state)
    ↓
Custom Hook (uses service/context)
    ↓
Service Layer (API call)
    ↓
Axios Instance (with interceptors)
    ↓
Backend API
```

### Communication Between Components

**Prefer this order:**

1. Props (for parent-child)
2. Custom Hooks (for specific logic)
3. Context (for global state)
4. React Query (for server state)

**Avoid:**

- Deep prop drilling
- Global state for everything
- Direct API calls in components

## 🎨 Component Development

### Component Template

```jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Brief component description
 * @component
 * @example
 * return (
 *   <MyComponent title="Example" onAction={handleAction} />
 * )
 */
export const MyComponent = ({
  title,
  onAction,
  variant = 'primary',
  disabled = false,
  className = '',
  ...rest
}) => {
  const [state, setState] = useState(null);

  const handleAction = () => {
    // Logic here
    onAction?.();
  };

  return (
    <div className={`my-component ${variant} ${className}`} {...rest}>
      {title}
    </div>
  );
};

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default MyComponent;
```

### Best Practices

1. **Functional Components Only** - No class components
2. **Props Validation** - Use PropTypes for all props
3. **Destructuring** - Always destructure props
4. **Naming** - Use descriptive, PascalCase names
5. **Comments** - Add JSDoc comments for complex logic
6. **Accessibility** - Include ARIA labels and semantic HTML
7. **Responsive** - Use TailwindCSS responsive classes
8. **Composition** - Create small, reusable components

### Component Checklist

Before marking a component as complete:

- [ ] Props validated with PropTypes
- [ ] Responsive design (test on mobile, tablet, desktop)
- [ ] Loading state handled
- [ ] Error state handled
- [ ] Disabled state handled
- [ ] Keyboard navigation works
- [ ] ARIA labels present
- [ ] Unit tests written
- [ ] Storybook story created (optional)
- [ ] Documentation updated

## 🔌 API Integration

### Using API Services

```jsx
import { useQuery } from '@tanstack/react-query';
import alertsService from '@services/alertsService';
import { useToast } from '@hooks/useToast';

export const MyComponent = () => {
  const toast = useToast();
  const { data, isLoading, error } = useQuery(
    ['alerts'],
    () => alertsService.getAlerts(1, 20)
  );

  if (isLoading) return <Spinner />;
  if (error) {
    toast(error.message, 'error');
    return <Alert type="danger">{error.message}</Alert>;
  }

  return <div>{data?.map(alert => ...)}</div>;
};
```

### Creating New API Service

```javascript
// services/myService.js
import api from './api';

export const myService = {
  // GET request
  getData: async (id) => {
    const response = await api.get(`/api/my-endpoint/${id}`);
    return response.data;
  },

  // POST request
  createData: async (payload) => {
    const response = await api.post('/api/my-endpoint', payload);
    return response.data;
  },

  // PATCH request
  updateData: async (id, payload) => {
    const response = await api.patch(`/api/my-endpoint/${id}`, payload);
    return response.data;
  },

  // DELETE request
  deleteData: async (id) => {
    const response = await api.delete(`/api/my-endpoint/${id}`);
    return response.data;
  },
};

export default myService;
```

### Error Handling

```jsx
try {
  const result = await authService.login(email, password);
  // Success handling
} catch (error) {
  if (error.response?.status === 401) {
    // Handle unauthorized
  } else if (error.response?.status === 422) {
    // Handle validation error
  } else if (error.code === 'ECONNABORTED') {
    // Handle timeout
  } else {
    // Handle generic error
  }
}
```

## 🔐 State Management

### Authentication Context

```jsx
import { useAuth } from '@hooks/useAuth';

export const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <div>Welcome {user.email}!</div>;
};
```

### React Query

```jsx
import { useQuery, useMutation } from '@tanstack/react-query';

// Reading data
const { data, isLoading, error } = useQuery(['key', id], () => fetchData(id));

// Mutating data
const { mutate, isPending } = useMutation((newData) => updateData(newData), {
  onSuccess: (data) => {
    queryClient.invalidateQueries(['key']);
  },
});

mutate(newData);
```

### Local State

```jsx
const [localState, setLocalState] = useState(initialValue);

// Or with reducer for complex state
const [state, dispatch] = useReducer(reducer, initialState);
```

## 🔑 Authentication

### Login Flow

```jsx
import { useAuth } from '@hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  return (/* form JSX */);
};
```

### Protected Routes

```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Token Management

Tokens are automatically:

- Stored in localStorage
- Added to request headers
- Refreshed on 401 response
- Cleared on logout

## 🔄 Real-time Features

### WebSocket Integration

```jsx
import { useWebSocket } from '@hooks/useWebSocket';
import { useEffect } from 'react';
import { WS_EVENTS } from '@utils/constants';

export const Dashboard = () => {
  const { socket, connected, on, emit } = useWebSocket();

  useEffect(() => {
    if (!connected) return;

    // Listen for new alerts
    const unsubscribe = on(WS_EVENTS.NEW_ALERT, (alert) => {
      console.log('New alert received:', alert);
      // Update UI
    });

    return () => unsubscribe();
  }, [connected, on]);

  return <div>{connected ? '🟢 Connected' : '🔴 Disconnected'}</div>;
};
```

## 🧪 Testing

### Unit Test Example

```javascript
import { render, screen } from '@testing-library/react';
import { Button } from '@components/common/Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalled();
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test Button

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## ⚡ Performance

### Code Splitting

```jsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('@pages/Dashboard'));

export const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Dashboard />
  </Suspense>
);
```

### Memoization

```jsx
import { memo, useMemo, useCallback } from 'react';

export const AlertCard = memo(({ alert, onAction }) => {
  const formattedDate = useMemo(() => formatDate(alert.timestamp), [alert.timestamp]);

  const handleClick = useCallback(() => {
    onAction(alert.id);
  }, [alert.id, onAction]);

  return <div onClick={handleClick}>{formattedDate}</div>;
});
```

### Bundle Analysis

```bash
# Build and analyze
npm run build
npm run preview

# Check bundle size
# Look in dist/ folder
```

## 🚀 Deployment

### Production Build

```bash
# Build optimized bundle
npm run build

# Test production build locally
npm run preview
```

### Environment Configuration

Production `.env`:

```env
VITE_API_BASE_URL=https://api.aeterna.com
VITE_WS_URL=https://api.aeterna.com/socket.io
VITE_NODE_ENV=production
```

### Deployment Platforms

**Railway:**

```bash
# Push to Railway
railway link <project-id>
railway up
```

**Render:**

```bash
# Connect GitHub repo
# Set build command: npm run build
# Set start command: npm run preview
```

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] No console warnings
- [ ] All env variables set
- [ ] API endpoints correct
- [ ] WebSocket URL correct
- [ ] Build succeeds without errors
- [ ] Bundle size acceptable
- [ ] Lighthouse score >80
- [ ] Mobile responsive verified
- [ ] Cross-browser tested

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Vite Documentation](https://vitejs.dev/)

## 🆘 Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

### WebSocket Connection Issues

1. Check backend is running
2. Verify WebSocket URL in .env
3. Check browser console for errors
4. Verify CORS settings on backend

### API Errors

1. Check backend is running
2. Verify API_BASE_URL in .env
3. Check network tab in DevTools
4. Verify request/response headers

### Build Failures

```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

---

**Last Updated**: February 19, 2026
**Document Version**: 1.0
