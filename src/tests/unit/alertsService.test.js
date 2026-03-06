/**
 * Unit tests for src/services/alertsService.js
 *
 * All api calls are mocked so no real HTTP traffic occurs.
 */
import { alertsService } from '@services/alertsService';

jest.mock('@services/api', () => ({
  __esModule: true,
  default: {
    get:    jest.fn(),
    post:   jest.fn(),
    patch:  jest.fn(),
    delete: jest.fn(),
  },
}));

import api from '@services/api';

const mockAlerts = [
  { id: 1, title: 'Alert 1', priority: 'HIGH',   status: 'new',  createdAt: '2024-01-01T00:00:00Z' },
  { id: 2, title: 'Alert 2', priority: 'MEDIUM', status: 'read', createdAt: '2024-01-02T00:00:00Z' },
  { id: 3, title: 'Alert 3', priority: 'LOW',    status: 'new',  createdAt: '2024-01-03T00:00:00Z' },
];

beforeEach(() => jest.clearAllMocks());

// ─── getAlerts ───────────────────────────────────────────────────────────────
describe('alertsService.getAlerts', () => {
  it('calls api.get with correct default params', async () => {
    api.get.mockResolvedValue({ data: mockAlerts });
    const result = await alertsService.getAlerts();
    expect(api.get).toHaveBeenCalledWith('/alerts', expect.objectContaining({
      params: expect.objectContaining({ _page: 1, _limit: 20 }),
    }));
    expect(result).toEqual(mockAlerts);
  });

  it('passes priority, status, entity, q filters', async () => {
    api.get.mockResolvedValue({ data: [] });
    await alertsService.getAlerts({ priority: 'HIGH', status: 'new', entity: 'ETH', q: 'whale' });
    expect(api.get).toHaveBeenCalledWith('/alerts', expect.objectContaining({
      params: expect.objectContaining({ priority: 'HIGH', status: 'new', entity: 'ETH', q: 'whale' }),
    }));
  });
});

// ─── getAlertsPage ───────────────────────────────────────────────────────────
describe('alertsService.getAlertsPage', () => {
  it('returns paginated result with total from header', async () => {
    api.get.mockResolvedValue({
      data: mockAlerts,
      headers: { 'x-total-count': '3' },
    });
    const result = await alertsService.getAlertsPage({ page: 1, limit: 10 });
    expect(result.items).toEqual(mockAlerts);
    expect(result.total).toBe(3);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('applies dateFrom and dateTo filters', async () => {
    api.get.mockResolvedValue({ data: [], headers: { 'x-total-count': '0' } });
    await alertsService.getAlertsPage({ dateFrom: '2024-01-01', dateTo: '2024-01-31' });
    const call = api.get.mock.calls[0][1].params;
    expect(call.createdAt_gte).toBeDefined();
    expect(call.createdAt_lte).toBeDefined();
  });
});

// ─── getAlertById ────────────────────────────────────────────────────────────
describe('alertsService.getAlertById', () => {
  it('calls api.get with correct endpoint', async () => {
    api.get.mockResolvedValue({ data: mockAlerts[0] });
    const result = await alertsService.getAlertById(1);
    expect(api.get).toHaveBeenCalledWith('/alerts/1');
    expect(result).toEqual(mockAlerts[0]);
  });
});

// ─── markAsRead ──────────────────────────────────────────────────────────────
describe('alertsService.markAsRead', () => {
  it('calls api.patch with status=read', async () => {
    api.patch.mockResolvedValue({ data: { ...mockAlerts[0], status: 'read' } });
    const result = await alertsService.markAsRead(1);
    expect(api.patch).toHaveBeenCalledWith('/alerts/1', expect.objectContaining({ status: 'read' }));
    expect(result.status).toBe('read');
  });
});

// ─── markMultipleAsRead ──────────────────────────────────────────────────────
describe('alertsService.markMultipleAsRead', () => {
  it('patches each alert id', async () => {
    api.patch.mockResolvedValue({ data: {} });
    await alertsService.markMultipleAsRead([1, 2, 3]);
    expect(api.patch).toHaveBeenCalledTimes(3);
  });
});

// ─── dismissAlert ─────────────────────────────────────────────────────────────
describe('alertsService.dismissAlert', () => {
  it('calls api.delete with correct endpoint', async () => {
    api.delete.mockResolvedValue({ data: {} });
    await alertsService.dismissAlert(2);
    expect(api.delete).toHaveBeenCalledWith('/alerts/2');
  });
});

// ─── dismissMultiple ─────────────────────────────────────────────────────────
describe('alertsService.dismissMultiple', () => {
  it('deletes each alert and returns count', async () => {
    api.delete.mockResolvedValue({});
    const result = await alertsService.dismissMultiple([1, 2]);
    expect(api.delete).toHaveBeenCalledTimes(2);
    expect(result.dismissed).toBe(2);
  });
});

// ─── getUnread ───────────────────────────────────────────────────────────────
describe('alertsService.getUnread', () => {
  it('fetches alerts with status=new', async () => {
    api.get.mockResolvedValue({ data: [mockAlerts[0]] });
    const result = await alertsService.getUnread();
    expect(api.get).toHaveBeenCalledWith('/alerts', expect.objectContaining({
      params: expect.objectContaining({ status: 'new' }),
    }));
    expect(result).toHaveLength(1);
  });
});

// ─── getAlertStats ───────────────────────────────────────────────────────────
describe('alertsService.getAlertStats', () => {
  it('computes correct stats', async () => {
    api.get.mockResolvedValue({ data: mockAlerts });
    const stats = await alertsService.getAlertStats();
    expect(stats.total).toBe(3);
    expect(stats.unread).toBe(2);  // status='new'
    expect(stats.high).toBe(1);
    expect(stats.medium).toBe(1);
    expect(stats.low).toBe(1);
  });
});

// ─── searchAlerts ─────────────────────────────────────────────────────────────
describe('alertsService.searchAlerts', () => {
  it('passes query via q param', async () => {
    api.get.mockResolvedValue({ data: [] });
    await alertsService.searchAlerts('whale');
    expect(api.get).toHaveBeenCalledWith('/alerts', expect.objectContaining({
      params: expect.objectContaining({ q: 'whale' }),
    }));
  });
});

// ─── createAlert ─────────────────────────────────────────────────────────────
describe('alertsService.createAlert', () => {
  it('posts alert data and sets default status=new', async () => {
    api.post.mockResolvedValue({ data: { id: 99, title: 'New', status: 'new' } });
    const result = await alertsService.createAlert({ title: 'New' });
    expect(api.post).toHaveBeenCalledWith('/alerts', expect.objectContaining({ status: 'new' }));
    expect(result.id).toBe(99);
  });

  it('preserves supplied status', async () => {
    api.post.mockResolvedValue({ data: { id: 100, status: 'read' } });
    await alertsService.createAlert({ title: 'X', status: 'read' });
    expect(api.post).toHaveBeenCalledWith('/alerts', expect.objectContaining({ status: 'read' }));
  });
});
