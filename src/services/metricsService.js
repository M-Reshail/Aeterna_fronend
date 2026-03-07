import api from './api';
import eventsService from './eventsService';

export const metricsService = {
  // ─── GET /ingestion/stats + /api/alerts/history + /api/admin/metrics ─────
  getAdminDashboard: async () => {
    const [stats, alerts, metrics] = await Promise.all([
      eventsService.getStats(),
      api.get('/api/alerts/history', { params: { limit: 500 } }),
      metricsService.getAdminMetrics().catch(() => null), // requires admin role; gracefully skip
    ]);

    const alertsArr = Array.isArray(alerts) ? alerts : [];

    return {
      summary: {
        totalEventsIngested: stats?.total_events ?? 0,
        totalAlertsGenerated: alertsArr.length,
        activeUsers:  metrics?.active_users  ?? null,
        systemUptime: metrics?.system_uptime ?? null,
        errorRate:    metrics?.error_rate    ?? null,
        eventsBySource: stats?.by_source ?? {},
        eventsByType:   stats?.by_type   ?? {},
        lastUpdated: new Date().toISOString(),
      },
      alertsByPriority: ['HIGH', 'MEDIUM', 'LOW'].map((priority) => ({
        priority,
        value: alertsArr.filter((a) => a.priority === priority).length,
      })),
      // Chart-ready arrays
      eventsBySource: Object.entries(stats?.by_source ?? {}).map(([source, count]) => ({
        source,
        count,
      })),
      eventsByType: Object.entries(stats?.by_type ?? {}).map(([type, count]) => ({
        type,
        count,
      })),
    };
  },

  // ─── GET /api/admin/metrics ────────────────────────────────────────────────
  // Returns { events_ingested_hourly, events_ingested_daily, alerts_generated,
  //           active_users, system_uptime, error_rate }
  getAdminMetrics: async () => {
    return api.get('/api/admin/metrics');
  },

  // ─── GET /api/admin/users/ ─────────────────────────────────────────────────
  getUsers: async ({ page = 1, limit = 10, query = '', role = '' } = {}) => {
    const users = await api.get('/api/admin/users/');
    if (!Array.isArray(users)) return { items: [], total: 0, page, limit, totalPages: 1 };

    // Client-side filter (API doesn't support query/role params)
    let filtered = users;
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter((u) => u.email?.toLowerCase().includes(q));
    }
    if (role) {
      filtered = filtered.filter((u) => u.role === role);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  },

  // ─── GET /api/admin/users/{user_id} ────────────────────────────────────────
  getUserDetails: async (userId) => {
    return api.get(`/api/admin/users/${userId}`);
  },

  // ─── PATCH /api/admin/users/{user_id}/toggle ───────────────────────────────
  updateUserStatus: async (userId) => {
    return api.patch(`/api/admin/users/${userId}/toggle`);
  },
};

export default metricsService;
