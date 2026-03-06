# AETERNA API Documentation

**API Base URL:** `https://aeterna-autonomous-alpha-engine.onrender.com`  
**Version:** 1.0.0 (Production-Ready)  
**Last Updated:** March 6, 2026

> **For Frontend Integration:** This API is deployed on Render and supports CORS for Vercel frontend.
> Set `VITE_API_URL=https://aeterna-autonomous-alpha-engine.onrender.com` in your frontend `.env`

---

## Table of Contents

1. [Quick Start (Frontend)](#quick-start-frontend)
2. [Authentication](#authentication)
3. [Automatic Updates](#automatic-updates)
4. [Events (Ingestion)](#events-ingestion)
5. [System Status](#system-status)
6. [Alerts](#alerts)
7. [User Profile](#user-profile)
8. [Error Codes](#error-codes)
9. [Rate Limiting](#rate-limiting)
10. [Frontend Examples](#frontend-examples)

---

## Quick Start (Frontend)

### 1. Setup Environment Variables

**.env (or .env.local for Vite)**

```env
VITE_API_URL=https://aeterna-autonomous-alpha-engine.onrender.com
VITE_SOCKET_URL=https://aeterna-autonomous-alpha-engine.onrender.com
```

### 2. Make Your First Request

```javascript
// Get crypto news events (no auth required)
fetch(
  "https://aeterna-autonomous-alpha-engine.onrender.com/ingestion/events?limit=20",
)
  .then((r) => r.json())
  .then((data) => console.log(data));
```

### 3. User Login

```javascript
async function login(email, password) {
  const response = await fetch(
    "https://aeterna-autonomous-alpha-engine.onrender.com/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${email}&password=${password}`,
    },
  );
  const { access_token } = await response.json();
  localStorage.setItem("token", access_token);
  return access_token;
}
```

### 4. Protected API Calls (with auth)

```javascript
async function getUserAlerts() {
  const token = localStorage.getItem("token");
  const response = await fetch(
    "https://aeterna-autonomous-alpha-engine.onrender.com/api/alerts/history",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.json();
}
```

### 5. Check Automatic Updates Status

```javascript
// Verify RSS feeds are being collected automatically
fetch(
  "https://aeterna-autonomous-alpha-engine.onrender.com/ingestion/auto-update-status",
)
  .then((r) => r.json())
  .then((status) => {
    if (status.auto_updates_enabled) {
      console.log("✅ Automatic updates running every 60 seconds");
    } else {
      console.log("⚠️  Automatic updates not running");
    }
  });
```

---

## Authentication

### OAuth2 Bearer Token

All protected endpoints require an `Authorization` header:

```
Authorization: Bearer <access_token>
```

**Get Token:**

```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=password123
```

**Response:** `200 OK`

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJSZWZyZXNoIn...",
  "token_type": "bearer"
}
```

---

## Automatic Updates

### Check Auto-Update Status

**Endpoint:** `GET /ingestion/auto-update-status`

**Description:** Check if automatic RSS collection and event processing is running

**Authentication:** Not required (public)

**Response:** `200 OK`

```json
{
  "status": "active",
  "auto_updates_enabled": true,
  "update_frequency": {
    "rss_collection": "every 60 seconds",
    "consumer_processing": "every 3 seconds (50 messages per batch)",
    "price_collection": "every 120 seconds"
  },
  "last_event_timestamp": "2026-03-06T12:37:45",
  "message": "🔄 Automatic updates RUNNING - new events fetched every 60 seconds"
}
```

**Inactive Response:** `200 OK`

```json
{
  "status": "inactive",
  "auto_updates_enabled": false,
  "message": "⚠️  Scheduler not running"
}
```

**What This Means:**

- ✅ **Active:** New crypto news is automatically fetched every 60 seconds from CoinDesk, CoinTelegraph, Decrypt
- ✅ **Active:** Events are continuously processed from queue every 3 seconds
- ❌ **Inactive:** Manual collection needed (contact backend team)

---

## System Status

### Get System Health

**Endpoint:** `GET /health/system`

**Description:** Check health of all system dependencies (RabbitMQ, PostgreSQL, Redis)

**Authentication:** Not required

**Response:** `200 OK`

```json
{
  "rabbitmq": "✅ Connected",
  "redis": "✅ Connected",
  "postgresql": "✅ Connected"
}
```

**Error Response:** `503 Service Unavailable`

```json
{
  "rabbitmq": "❌ Connection refused",
  "redis": "✅ Connected",
  "postgresql": "❌ Connection timeout"
}
```

## Events (Ingestion)

### List All Events

**Endpoint:** `GET /ingestion/events`

**Description:** Retrieve all ingested events with optional filtering

**Authentication:** Not required (public)

**Query Parameters:**
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| skip | integer | No | Offset for pagination | `0` |
| limit | integer | No | Results per page (max 500) | `100` |
| source | string | No | Filter by source | `coindesk` |
| type | string | No | Filter by type | `news` |
| start_date | string (ISO 8601) | No | Events after date | `2026-03-01T00:00:00` |
| end_date | string (ISO 8601) | No | Events before date | `2026-03-02T00:00:00` |

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "source": "coindesk",
    "type": "news",
    "timestamp": "2026-03-01T15:30:00",
    "content": {
      "title": "Bitcoin Reaches New High",
      "summary": "Bitcoin price surges past $50,000",
      "link": "https://coindesk.com/..."
    },
    "raw": null
  },
  {
    "id": 2,
    "source": "coingecko",
    "type": "price",
    "timestamp": "2026-03-01T15:35:00",
    "content": {
      "symbol": "BTC",
      "price": 50234.5,
      "change_24h": 3.45
    },
    "raw": null
  }
]
```

**Error Response:** `400 Bad Request`

```json
{
  "detail": "Invalid date format. Use ISO 8601: 2026-03-01T00:00:00"
}
```

---

### Get Single Event

**Endpoint:** `GET /ingestion/events/{event_id}`

**Description:** Retrieve a specific event by ID

**Authentication:** Not required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| event_id | integer | Event ID |

**Response:** `200 OK`

```json
{
  "id": 1,
  "source": "coindesk",
  "type": "news",
  "timestamp": "2026-03-01T15:30:00",
  "content": {
    "title": "Bitcoin Reaches New High",
    "summary": "Bitcoin price surges past $50,000",
    "link": "https://coindesk.com/..."
  }
}
```

**Error Response:** `404 Not Found`

```json
{
  "detail": "Event not found"
}
```

---

### Get Events by Source

**Endpoint:** `GET /ingestion/search/by-source/{source}`

**Description:** Filter events by collection source

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| source | string | Source name (e.g., "coindesk", "coingecko") |

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| skip | integer | Pagination offset |
| limit | integer | Results per page (max 500) |

**Response:** `200 OK` (Array of events)

**Example:**

```bash
curl "http://localhost:8000/ingestion/search/by-source/coindesk?limit=10"
```

---

### Get Events by Type

**Endpoint:** `GET /ingestion/search/by-type/{type}`

**Description:** Filter events by type

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Type: "news" or "price" |

**Response:** `200 OK` (Array of events)

---

### Get Event Statistics

**Endpoint:** `GET /ingestion/stats`

**Description:** Get aggregated statistics about collected events

**Authentication:** Not required

**Response:** `200 OK`

```json
{
  "total_events": 1234,
  "by_source": {
    "coindesk": 500,
    "coingecko": 734
  },
  "by_type": {
    "news": 500,
    "price": 734
  }
}
```

---

## Alerts

### Get Alert History

**Endpoint:** `GET /api/alerts/history`

**Description:** Get alerts for the authenticated user with filtering

**Authentication:** Required (Bearer token)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| skip | integer | Pagination offset (default: 0) |
| limit | integer | Results per page (default: 20, max: 50) |
| priority | string | Filter: "HIGH", "MEDIUM", "LOW" |
| start_date | string (ISO 8601) | Alerts after date |
| end_date | string (ISO 8601) | Alerts before date |

**Response:** `200 OK`

```json
[
  {
    "alert_id": "1",
    "created_at": "2026-03-01T15:30:00",
    "title": "alert_1",
    "priority": "HIGH",
    "entity": null,
    "status": "pending",
    "read_at": null
  },
  {
    "alert_id": "2",
    "created_at": "2026-03-01T15:35:00",
    "title": "alert_2",
    "priority": "MEDIUM",
    "entity": null,
    "status": "read",
    "read_at": "2026-03-01T15:40:00"
  }
]
```

**Error Response:** `401 Unauthorized`

```json
{
  "detail": "Not authenticated"
}
```

**Error Response:** `403 Forbidden`

```json
{
  "detail": "Access denied - different user's alerts"
}
```

---

### Get Single Alert

**Endpoint:** `GET /api/alerts/{alert_id}`

**Description:** Get a specific alert

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| alert_id | integer | Alert ID |

**Response:** `200 OK` (Single alert object)

**Error Response:** `404 Not Found` or `403 Forbidden`

---

### Mark Alert as Read

**Endpoint:** `PATCH /api/alerts/{alert_id}`

**Description:** Mark an alert as read

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| alert_id | integer | Alert ID |

**Response:** `200 OK`

```json
{
  "alert_id": "1",
  "created_at": "2026-03-01T15:30:00",
  "title": "alert_1",
  "priority": "HIGH",
  "entity": null,
  "status": "read",
  "read_at": "2026-03-01T16:30:00"
}
```

---

### Delete Alert

**Endpoint:** `DELETE /api/alerts/{alert_id}`

**Description:** Dismiss/delete an alert

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| alert_id | integer | Alert ID |

**Response:** `200 OK`

```json
{
  "detail": "Alert dismissed successfully"
}
```

---

### Export Alert History

**Endpoint:** `GET /api/alerts/history/export`

**Description:** Export alerts as CSV file

**Authentication:** Required

**Query Parameters:** Same as `/api/alerts/history`

**Response:** `200 OK` (CSV file download)

**CSV Format:**

```
alert_id,created_at,title,priority,status
1,2026-03-01T15:30:00,alert_1,HIGH,pending
2,2026-03-01T15:35:00,alert_2,MEDIUM,read
```

---

## Authentication & Identity

### Register User

**Endpoint:** `POST /auth/register`

**Description:** Create a new user account

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJSZWZyZXNoIn...",
  "token_type": "bearer"
}
```

**Error Response:** `400 Bad Request`

```json
{
  "detail": "Email already registered"
}
```

---

### Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and get tokens

**Authentication:** Not required

**Request Body:**

```
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=securepassword123
```

**Response:** `200 OK` (Same as register)

**Error Response:** `401 Unauthorized`

```json
{
  "detail": "Invalid credentials"
}
```

---

### Refresh AccessToken

**Endpoint:** `POST /auth/refresh`

**Description:** Get a new access token using refresh token

**Request Body:**

```json
{
  "refresh_token": "eyJ0eXAiOiJSZWZyZXNoIn..."
}
```

**Response:** `200 OK`

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc... (new token)",
  "refresh_token": "eyJ0eXAiOiJSZWZyZXNoIn... (new token)",
  "token_type": "bearer"
}
```

---

### Get User Profile

**Endpoint:** `GET /auth/profile`

**Description:** Get current user's profile

**Authentication:** Required

**Response:** `200 OK`

```json
{
  "id": 1,
  "email": "user@example.com",
  "telegram_id": "123456789",
  "preferences": {
    "notifications_enabled": true,
    "email_frequency": "immediate"
  },
  "created_at": "2026-02-15T10:00:00",
  "email_verified": true
}
```

---

### Update User Profile

**Endpoint:** `PATCH /auth/profile`

**Description:** Update user profile (Telegram ID, preferences)

**Authentication:** Required

**Request Body:**

```json
{
  "telegram_id": "987654321",
  "preferences": {
    "notifications_enabled": true,
    "email_frequency": "daily_digest"
  }
}
```

**Response:** `200 OK` (Updated profile)

---

### Request Password Reset

**Endpoint:** `POST /auth/password-reset/request`

**Description:** Request a password reset

**P0 Security Fix:** Reset token is sent ONLY via email, not in response

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`

```json
{
  "message": "If an account with this email exists, a password reset link has been sent. Check your email.",
  "email": "user@example.com"
}
```

---

### Confirm Password Reset

**Endpoint:** `POST /auth/password-reset/confirm`

**Description:** Confirm password reset with token (token from email)

**Request Body:**

```json
{
  "token": "reset_token_from_email",
  "new_password": "newpassword123"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## Error Codes

| HTTP Code | Error Code            | Meaning                     | Example                             |
| --------- | --------------------- | --------------------------- | ----------------------------------- |
| 400       | `BAD_REQUEST`         | Invalid input               | Missing required field              |
| 401       | `UNAUTHORIZED`        | Missing or invalid token    | No Authorization header             |
| 403       | `FORBIDDEN`           | Authenticated but no access | User accessing another user's alert |
| 404       | `NOT_FOUND`           | Resource doesn't exist      | Alert ID doesn't exist              |
| 409       | `CONFLICT`            | Resource already exists     | Email already registered            |
| 429       | `RATE_LIMITED`        | Too many requests           | Exceeded rate limit                 |
| 500       | `INTERNAL_ERROR`      | Server error                | Database connection failed          |
| 503       | `SERVICE_UNAVAILABLE` | Dependency down             | RabbitMQ unavailable                |

---

## Rate Limiting

**Global Rate Limit:**

- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

**Endpoint-Specific Limits:**

- `/auth/login`: 5 attempts per 5 minutes per IP
- `/auth/register`: 3 new accounts per hour per IP
- `/ingestion/events`: 1000 requests per minute

**Response Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1614556800
```

**Rate Limit Exceeded Response:** `429 Too Many Requests`

```json
{
  "detail": "Rate limit exceeded. Retry after 45 seconds"
}
```

---

## Frontend Examples

### JavaScript / Vue / React

```javascript
// 1. Configure API
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://aeterna-autonomous-alpha-engine.onrender.com";

// 2. Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

// 3. Get events
async function getEvents(limit = 20, source = null) {
  let url = `/ingestion/events?limit=${limit}`;
  if (source) url += `&source=${source}`;
  return apiCall(url);
}

// 4. Login
async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `username=${email}&password=${password}`,
  });
  const data = await response.json();
  localStorage.setItem("token", data.access_token);
  return data;
}

// 5. Get alerts
async function getAlerts() {
  return apiCall("/api/alerts/history?limit=50");
}

// 6. Mark alert as read
async function markAlertRead(alertId) {
  return apiCall(`/api/alerts/${alertId}`, {
    method: "PATCH",
  });
}

// 7. Stats
async function getStats() {
  return apiCall("/ingestion/stats");
}

// 8. Auto-update status
async function checkAutoUpdates() {
  return apiCall("/ingestion/auto-update-status");
}
```

### React Hook Example

```javascript
import { useState, useEffect } from "react";

function useEvents(limit = 20) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await apiCall(`/ingestion/events?limit=${limit}`);
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    // Refresh every 30 seconds for new events
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, [limit]);

  return { events, loading, error };
}

// Usage in component
function EventsComponent() {
  const { events, loading, error } = useEvents(20);

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Crypto News ({events.length} events)</h2>
      {events.map((event) => (
        <div key={event.id}>
          <h3>{event.content.title}</h3>
          <p>{event.content.summary}</p>
          <small>
            {event.source} • {event.timestamp}
          </small>
        </div>
      ))}
    </div>
  );
}
```

### Python Example

```python
import requests
from datetime import datetime, timedelta

BASE_URL = "https://aeterna-autonomous-alpha-engine.onrender.com"

# 1. Register
response = requests.post(f"{BASE_URL}/auth/register", json={
    "email": "user@example.com",
    "password": "securepassword123"
})
tokens = response.json()
access_token = tokens["access_token"]

# 2. Get Headers with auth
headers = {"Authorization": f"Bearer {access_token}"}

# 3. Get events (no auth needed)
response = requests.get(f"{BASE_URL}/ingestion/events?limit=20")
events = response.json()
print(f"Found {len(events)} events")

# 4. Get stats
response = requests.get(f"{BASE_URL}/ingestion/stats")
stats = response.json()
print(f"Total events in backend: {stats['total_events']}")
print(f"Sources: {stats['by_source']}")

# 5. Get alerts (with auth)
response = requests.get(f"{BASE_URL}/api/alerts/history", headers=headers)
alerts = response.json()
print(f"Your alerts: {len(alerts)}")

# 6. Check auto-updates
response = requests.get(f"{BASE_URL}/ingestion/auto-update-status")
status = response.json()
print(f"Auto-updates: {status['status']}")
```

### cURL Examples

```bash
# 1. Get events (no auth)
curl https://aeterna-autonomous-alpha-engine.onrender.com/ingestion/events

# 2. Get recent news
curl "https://aeterna-autonomous-alpha-engine.onrender.com/ingestion/events?limit=10&source=decrypt.co"

# 3. Check stats
curl https://aeterna-autonomous-alpha-engine.onrender.com/ingestion/stats

# 4. Check auto-updates
curl https://aeterna-autonomous-alpha-engine.onrender.com/ingestion/auto-update-status

# 5. Login
curl -X POST https://aeterna-autonomous-alpha-engine.onrender.com/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=password123"

# 6. Get alerts (replace TOKEN with actual token)
curl -H "Authorization: Bearer TOKEN" \
  https://aeterna-autonomous-alpha-engine.onrender.com/api/alerts/history
```

---

## Swagger/OpenAPI UI

Interactive API documentation available at:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

These provide:

- Interactive endpoint testing
- Parameter documentation
- Request/response examples
- Schema definitions
