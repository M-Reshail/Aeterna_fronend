import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import alertsService from '@services/alertsService';

const ALERT_KEYS = {
  all:     ['alerts'],
  list:    (filters) => ['alerts', 'list', filters],
  page:    (filters, page, limit) => ['alerts', 'page', filters, page, limit],
  detail:  (id)      => ['alerts', 'detail', id],
  stats:   ()        => ['alerts', 'stats'],
};

const PAGE_LIMIT = 10;

// ─── Infinite alerts list ─────────────────────────────────────────────────────
const normalizeAlertId = (a, id) => (a.alert_id != null ? String(a.alert_id) === String(id) : a.id === id);

export const useInfiniteAlerts = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: ALERT_KEYS.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      alertsService.getAlerts({ skip: (pageParam - 1) * PAGE_LIMIT, limit: PAGE_LIMIT, ...filters }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!Array.isArray(lastPage) || lastPage.length < PAGE_LIMIT) return undefined;
      return allPages.length + 1;
    },
    staleTime: 1000 * 30,
  });
};

export const usePaginatedAlerts = ({ page = 1, limit = 20, ...filters } = {}) => {
  return useQuery({
    queryKey: ALERT_KEYS.page(filters, page, limit),
    queryFn: () => alertsService.getAlertsPage({ page, limit, ...filters }),
    keepPreviousData: true,
    staleTime: 1000 * 30,
  });
};

// ─── Single alert by ID ───────────────────────────────────────────────────────
export const useAlertById = (alertId) => {
  return useQuery({
    queryKey: ALERT_KEYS.detail(alertId),
    queryFn:  () => alertsService.getAlertById(alertId),
    enabled:  !!alertId,
    staleTime: 1000 * 60,
  });
};

// ─── Alert stats ──────────────────────────────────────────────────────────────
export const useAlertStats = () => {
  return useQuery({
    queryKey: ALERT_KEYS.stats(),
    queryFn:  alertsService.getAlertStats,
    staleTime: 1000 * 60,
  });
};

// ─── Mark as read (optimistic) ────────────────────────────────────────────────
export const useMarkAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId) => alertsService.markAsRead(alertId),
    onMutate: async (alertId) => {
      await qc.cancelQueries({ queryKey: ALERT_KEYS.all });
      // Optimistically update every page in every list
      qc.setQueriesData({ queryKey: ALERT_KEYS.all }, (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            Array.isArray(page)
              ? page.map((a) => (a.id === alertId ? { ...a, status: 'read' } : a))
              : page
          ),
        };
      });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ALERT_KEYS.all }),
  });
};

// ─── Dismiss alert (optimistic remove) ───────────────────────────────────────
export const useDismissAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId) => alertsService.dismissAlert(alertId),
    onMutate: async (alertId) => {
      await qc.cancelQueries({ queryKey: ALERT_KEYS.all });
      qc.setQueriesData({ queryKey: ALERT_KEYS.all }, (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            Array.isArray(page) ? page.filter((a) => !normalizeAlertId(a, alertId)) : page
          ),
        };
      });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ALERT_KEYS.all }),
  });
};

// ─── Search alerts (client-side filter on recent history) ─────────────────────
export const useSearchAlerts = (query) => {
  return useQuery({
    queryKey: ['alerts', 'search', query],
    queryFn: async () => {
      const items = await alertsService.getAlerts({ skip: 0, limit: 200 });
      if (!Array.isArray(items)) return [];
      const q = query.toLowerCase();
      return items.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.priority?.toLowerCase().includes(q) ||
          a.entity?.toLowerCase().includes(q)
      );
    },
    enabled: !!query && query.length >= 2,
    staleTime: 1000 * 30,
  });
};

export default useInfiniteAlerts;

