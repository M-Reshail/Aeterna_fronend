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
export const useInfiniteAlerts = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: ALERT_KEYS.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      alertsService.getAlerts({ page: pageParam, limit: PAGE_LIMIT, ...filters }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // json-server returns array; if returned fewer than limit, no more pages
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
            Array.isArray(page) ? page.filter((a) => a.id !== alertId) : page
          ),
        };
      });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ALERT_KEYS.all }),
  });
};

// ─── Search alerts ────────────────────────────────────────────────────────────
export const useSearchAlerts = (query) => {
  return useQuery({
    queryKey: ['alerts', 'search', query],
    queryFn:  () => alertsService.searchAlerts(query),
    enabled:  !!query && query.length >= 2,
    staleTime: 1000 * 30,
  });
};

export default useInfiniteAlerts;

