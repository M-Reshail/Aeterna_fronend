# Sign-In Debugging Guide

## How to Debug the Login Issue

### Step 1: Open Browser Console
Press **F12** to open Developer Tools → Click on the **Console** tab

### Step 2: Try to Sign In
1. Go to http://localhost:3000 (or whatever port is shown)
2. Click **Sign In / Login**
3. Enter credentials:
   - Email: `test@example.com`
   - Password: `Test@1234`
4. Click **Sign In**

### Step 3: Check the Console Logs

You should see a sequence of logs like:

```
🔐 authService.login - Fetching user with email: test@example.com
📡 API Response: [{id: 1, email: "test@example.com", ...}]
👤 Found user: {id: 1, email: "test@example.com", ...}
✅ Password match! Generating token...
🎫 Token data: {access_token: "mock_token_1_...", user: {...}}
🔐 AuthContext.login - Starting login for: test@example.com
✅ AuthContext.login - Received response: {access_token: "...", user: {...}}
💾 AuthContext.login - Setting state with token and user: {id: 1, email: "...", name: "..."}
🔐 Attempting login with: test@example.com
✅ Login response: {access_token: "...", user: {...}}
📍 Navigating to dashboard...
```

### Common Issues & Solutions

#### Issue 1: "User not found"
- ❌ Error: `User not found`
- Solution: Check `db.json` to ensure the user exists
- Verify email exactly: `test@example.com` (case-sensitive)

#### Issue 2: "Password mismatch"  
- ❌ Error: `Password mismatch. Expected: Test@1234 Got: Test1234`
- Solution: Check password in `db.json` matches exactly
- Current password: `Test@1234`

#### Issue 3: API Error (Network Error)
- ❌ Error: `Failed to fetch`, `Network Error`, or similar
- Solutions:
  - Check JSON Server is running: http://localhost:8000
  - Check it shows "Resources" when you visit that URL
  - Make sure `npm run dev:all` is running both servers

#### Issue 4: Dashboard Not Loading After Login
- ❌ You login successfully but dashboard doesn't show
- Solutions:
  - Check browser console for routing errors
  - Check that `/dashboard` route is defined in `src/App.jsx`
  - Verify Dashboard.jsx file exists at `src/pages/Dashboard.jsx`
  - Check localStorage: Open DevTools → Application → Local Storage → look for `access_token`

### Manual API Testing

#### Test 1: Check JSON Server is Working
```bash
curl http://localhost:8000/users
```
Should return a JSON array with users

#### Test 2: Get User by Email
```bash
curl "http://localhost:8000/users?email=test@example.com"
```
Should return the user object

#### Test 3: Create New User (Registration Test)
```bash
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"Test@1234","name":"New User","createdAt":"2024-02-22T00:00:00Z","verified":true}'
```

### Database File Location
`d:\Aterna\db.json`

You can edit it directly to:
- Add more test users
- Change passwords
- Add more test data

Changes take effect immediately.

### App URLs
- **Frontend:** http://localhost:3000 (or 3001-3003 depending on availability)
- **JSON Server:** http://localhost:8000
- **Login Page:** http://localhost:3000/login
- **Dashboard:** http://localhost:3000/dashboard
- **Sign Up:** http://localhost:3000/register

### File Locations
- Login Logic: `src/pages/Login.jsx`
- Auth Service: `src/services/authService.js`
- Auth Context: `src/contexts/AuthContext.jsx`
- Database: `db.json`

---

**Status:** Added comprehensive logging to trace login flow  
**Next:** Check console logs and report what you see
