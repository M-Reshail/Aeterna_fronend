# Local Testing Setup Guide

## About the Dashboard Folder

The empty `src/components/dashboard` folder is reserved for **dashboard-specific components** that will be developed in future iterations. Currently, all dashboard UI is in the main `Dashboard.jsx` page file, but as the dashboard grows in complexity, it will be divided into reusable sub-components:

- `src/components/dashboard/AlertCard.jsx` - Individual alert card component
- `src/components/dashboard/AlertFilter.jsx` - Filter sidebar component  
- `src/components/dashboard/AlertModal.jsx` - Detail modal component
- `src/components/dashboard/MetricsPanel.jsx` - Metrics display
- `src/components/dashboard/AlertFeed.jsx` - Alert list wrapper

This follows the principle of separating concerns and making components more reusable as the app scales.

## Testing Sign-up & Sign-in Locally

### What Was Added

✅ **JSON Server** - A fake REST API server that uses `db.json` as the database  
✅ **db.json** - Local testing database with sample users and alerts  
✅ **concurrently** - Run frontend and backend in parallel  

### Quick Start

#### Option 1: Run Frontend & API Together (Recommended)

```bash
npm run dev:all
```

This runs:
- ✅ Vite frontend on `http://localhost:5173` (or 3001 if 5173 is taken)
- ✅ JSON Server API on `http://localhost:8000`

#### Option 2: Run Separately

**Terminal 1 - Start Backend API:**
```bash
npm run dev:api
```
Starts JSON Server on `http://localhost:8000`

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```
Starts Vite on `http://localhost:5173`

### Test Credentials

**Pre-existing User** (for testing sign-in):
- Email: `test@example.com`
- Password: `Test@1234`

### Testing Steps

#### 1. **Test Sign-in**
1. Open app at `http://localhost:3001` (or as shown in terminal)
2. Click **Sign-in** or go to `/login`
3. Enter:
   - Email: `test@example.com`
   - Password: `Test@1234`
4. Click Sign-in
5. You should be redirected to `/dashboard` with the test user logged in

#### 2. **Test Sign-up** (Create New Account)
1. Go to `/register` or click **Sign-up**
2. Enter new credentials:
   - Email: `newuser@example.com`
   - Password: `NewUser@1234`
   - Confirm Password: `NewUser@1234`
3. Check **I agree to the Terms**
4. Click Register
5. Account is saved to `db.json` and you're redirected to `/dashboard`

#### 3. **View Database Changes**
- New users get added to `db.json`'s `users` array
- Check `db.json` in the project root to see the data structure

### Database Structure

The `db.json` file contains these collections:

```json
{
  "users": [users],           // Authentication data
  "alerts": [alerts],         // Sample alerts for testing
  "preferences": [prefs],     // User preferences
  "metrics": [metrics]        // Sample metrics data
}
```

### API Endpoints Available

All endpoints are available at `http://localhost:8000/`:

```
POST   /users             - Create new user
GET    /users             - Get all users
GET    /users/:id         - Get specific user
PUT    /users/:id         - Update user
DELETE /users/:id         - Delete user

GET    /alerts            - Get all alerts
GET    /alerts/:id        - Get specific alert
POST   /alerts            - Create alert
PUT    /alerts/:id        - Update alert
DELETE /alerts/:id        - Delete alert

GET    /preferences       - Get all preferences
GET    /preferences/:id   - Get specific preference
PUT    /preferences/:id   - Update preference

GET    /metrics           - Get metrics
```

### Modifying Test Data

You can edit `db.json` directly to:
- Add more test users
- Add more sample alerts
- Modify existing data
- Set different preferences

Changes take effect immediately when you save the file (JSON Server watches for changes).

### Example: Add More Test Users

Edit `db.json` and add to the `users` array:

```json
{
  "id": 2,
  "email": "jane@example.com",
  "password": "Jane@1234",
  "name": "Jane Smith",
  "createdAt": "2024-02-19T00:00:00Z",
  "verified": true
}
```

Then test sign-in with `jane@example.com / Jane@1234`.

### Common Issues

**Issue:** Port 8000 already in use
- Solution: Edit `vite.config.js` to use a different port, or kill the process using 8000

**Issue:** API requests failing
- Check console: Are requests going to `http://localhost:8000`?
- Check `.env` file has `VITE_API_BASE_URL=http://localhost:8000`

**Issue:** Sign-in not working
- Verify email and password match exactly in `db.json`
- Check that server is running on port 8000

### Next: Connect to Real Backend

When ready to connect to the real backend API:

1. Update `.env`:
   ```
   VITE_API_BASE_URL=https://your-api-domain.com
   VITE_WS_URL=wss://your-api-domain.com/socket.io
   ```

2. Stop the JSON Server

3. Restart the frontend - it will now connect to your real backend

---

**Status:** ✅ Local testing setup is ready. Use `npm run dev:all` to start testing!
