import api from './api';

export const alertsService = {
  // ─── Get all alerts (json-server supports _page, _limit, _sort, _order) ───
  getAlerts: async ({ page = 1, limit = 20, priority, status, entity, q } = {}) => {
    const params = { _page: page, _limit: limit, _sort: 'createdAt', _order: 'desc' };
    if (priority) params.priority = priority;
    if (status)   params.status   = status;
    if (entity)   params.entity   = entity;
    if (q)        params.q        = q;

    const response = await api.get('/alerts', { params });
    return response.data;
  },

  getAlertsPage: async ({
    page = 1,
    limit = 20,
    priority,
    status,
    entity,
    q,
    dateFrom,
    dateTo,
  } = {}) => {
    const params = { _page: page, _limit: limit, _sort: 'createdAt', _order: 'desc' };
    if (priority) params.priority = priority;
    if (status) params.status = status;
    if (entity) params.entity = entity;
    if (q) params.q = q;
    if (dateFrom) params.createdAt_gte = new Date(dateFrom).toISOString();
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      params.createdAt_lte = end.toISOString();
    }

    const response = await api.get('/alerts', { params });
    const total = Number(response.headers['x-total-count'] ?? 0);

    return {
      items: response.data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  },

  // ─── Get single alert by ID ────────────────────────────────────────────────
  getAlertById: async (alertId) => {
    const response = await api.get(`/alerts/${alertId}`);
    return response.data;
  },

  // ─── Mark single alert as read ────────────────────────────────────────────
  markAsRead: async (alertId) => {
    const response = await api.patch(`/alerts/${alertId}`, {
      status: 'read',
      readAt: new Date().toISOString(),
    });
    return response.data;
  },

  // ─── Mark multiple alerts as read (json-server has no bulk endpoint) ──────
  markMultipleAsRead: async (alertIds) => {
    const results = await Promise.all(
      alertIds.map((id) =>
        api.patch(`/alerts/${id}`, {
          status: 'read',
          readAt: new Date().toISOString(),
        })
      )
    );
    return results.map((r) => r.data);
  },

  // ─── Dismiss (delete) a single alert ──────────────────────────────────────
  dismissAlert: async (alertId) => {
    const response = await api.delete(`/alerts/${alertId}`);
    return response.data;
  },

  // ─── Dismiss multiple alerts ───────────────────────────────────────────────
  dismissMultiple: async (alertIds) => {
    await Promise.all(alertIds.map((id) => api.delete(`/alerts/${id}`)));
    return { dismissed: alertIds.length };
  },

  // ─── Get unread alerts only ───────────────────────────────────────────────
  getUnread: async () => {
    const response = await api.get('/alerts', {
      params: { status: 'new', _sort: 'createdAt', _order: 'desc' },
    });
    return response.data;
  },

  // ─── Get alert stats from current data ────────────────────────────────────
  getAlertStats: async () => {
    const response = await api.get('/alerts');
    const alerts = response.data;
    return {
      total:    alerts.length,
      unread:   alerts.filter((a) => a.status === 'new').length,
      high:     alerts.filter((a) => a.priority === 'HIGH').length,
      medium:   alerts.filter((a) => a.priority === 'MEDIUM').length,
      low:      alerts.filter((a) => a.priority === 'LOW').length,
    };
  },

  // ─── Search alerts by title / content ─────────────────────────────────────
  searchAlerts: async (query) => {
    // json-server full-text search uses q= param
    const response = await api.get('/alerts', { params: { q: query } });
    return response.data;
  },

  // ─── Create a new alert ───────────────────────────────────────────────────
  createAlert: async (alertData) => {
    const response = await api.post('/alerts', {
      ...alertData,
      status:    alertData.status    || 'new',
      timestamp: alertData.timestamp || new Date().toISOString(),
    });
    return response.data;
  },
};

export default alertsService;

