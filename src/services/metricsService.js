import api from './api';

const toDateKey = (dateValue) => new Date(dateValue).toISOString().slice(0, 10);

const fillMissingDays = (series, days = 7) => {
  const now = new Date();
  const map = new Map(series.map((item) => [item.date, item]));
  const result = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - index);
    const key = day.toISOString().slice(0, 10);
    result.push(map.get(key) || { date: key, value: 0 });
  }

  return result;
};

export const metricsService = {
  getAdminDashboard: async () => {
    const [metricsRes, alertsRes, usersRes] = await Promise.all([
      api.get('/metrics'),
      api.get('/alerts'),
      api.get('/users'),
    ]);

    const metrics = Array.isArray(metricsRes.data) ? metricsRes.data : [];
    const alerts = Array.isArray(alertsRes.data) ? alertsRes.data : [];
    const users = Array.isArray(usersRes.data) ? usersRes.data : [];

    const latestMetric = metrics[metrics.length - 1] || null;
    const activeUsers = users.filter((user) => user.active !== false).length;
    const totalEvents = metrics.reduce((sum, item) => sum + (item.eventsPerSecond || 0), 0);
    const errorRate = Number(
      (
        metrics.length > 0
          ? metrics.reduce((sum, item) => sum + (item.errorRate ?? 0.8), 0) / metrics.length
          : 0.8
      ).toFixed(2)
    );

    return {
      summary: {
        totalEventsIngested: totalEvents,
        totalAlertsGenerated: alerts.length,
        activeUsers,
        systemUptime: latestMetric?.systemHealth ?? 99.2,
        errorRate,
        lastUpdated: new Date().toISOString(),
      },
      eventsOverTime: fillMissingDays(
        metrics.map((item) => ({
          date: toDateKey(item.timestamp),
          value: item.eventsPerSecond || 0,
        })),
        7
      ),
      alertsByPriority: ['HIGH', 'MEDIUM', 'LOW'].map((priority) => ({
        priority,
        value: alerts.filter((alert) => alert.priority === priority).length,
      })),
      userGrowth: fillMissingDays(
        users.reduce((accumulator, user) => {
          const key = toDateKey(user.createdAt || new Date().toISOString());
          const existing = accumulator.find((item) => item.date === key);
          if (existing) existing.value += 1;
          else accumulator.push({ date: key, value: 1 });
          return accumulator;
        }, []),
        14
      ).reduce((accumulator, item) => {
        const previous = accumulator[accumulator.length - 1]?.value ?? 0;
        accumulator.push({ ...item, value: previous + item.value });
        return accumulator;
      }, []),
    };
  },

  getUsers: async ({ page = 1, limit = 10, query = '', role = '' } = {}) => {
    const response = await api.get('/users');
    let users = Array.isArray(response.data) ? response.data : [];

    if (query) {
      const normalized = query.toLowerCase();
      users = users.filter((user) =>
        user.email?.toLowerCase().includes(normalized) ||
        user.name?.toLowerCase().includes(normalized)
      );
    }

    if (role) {
      users = users.filter((user) => (user.role || 'user') === role);
    }

    const total = users.length;
    const offset = (page - 1) * limit;
    const items = users.slice(offset, offset + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  },

  getUserDetails: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateUserStatus: async (userId, active) => {
    const response = await api.patch(`/users/${userId}`, { active });
    return response.data;
  },
};

export default metricsService;
