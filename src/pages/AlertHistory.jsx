import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, RefreshCw, Search, X } from 'lucide-react';
import Tooltip from '@components/common/Tooltip';
import { AlertDetailModal } from '@components/dashboard/AlertDetailModal';
import { useDismissAlert, useMarkAsRead, usePaginatedAlerts } from '@hooks/useAlerts';
import alertsService from '@services/alertsService';
import { formatRelativeTime } from '@utils/helpers';
import { useToast } from '@hooks/useToast';
import { useAuth } from '@hooks/useAuth';
import feedbackService from '@services/feedbackService';

const PAGE_SIZE = 10;

const useDebounce = (value, delay = 450) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const PRIORITY_STYLE = {
  HIGH: 'bg-red-500/10 text-red-400 border border-red-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  LOW: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
};

const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-4 py-3.5 border-b border-[#161616] animate-pulse">
    <div className="w-1.5 h-1.5 rounded-full bg-[#1f1f1f] flex-shrink-0" />
    <div className="flex-1 min-w-0 space-y-1.5">
      <div className="h-3.5 bg-[#1f1f1f] rounded w-1/2" />
      <div className="h-3 bg-[#161616] rounded w-3/4" />
    </div>
    <div className="hidden sm:block w-14 h-5 bg-[#1f1f1f] rounded" />
    <div className="hidden md:block w-24 h-3 bg-[#161616] rounded" />
  </div>
);

// Safe converter: objects → string, fallback to '—'
const safeToString = (value, fallback = '—') => {
  if (typeof value === 'string') return value || fallback;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value && typeof value === 'object') {
    // If it's an object, try to extract summary/title/description
    return (value.summary || value.title || value.description || JSON.stringify(value).substring(0, 50)) || fallback;
  }
  return fallback;
};

const AlertRow = React.memo(({ alert, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(alert)}
    className={`w-full text-left flex items-center gap-4 px-4 py-3.5 border-b border-[#161616] transition-colors duration-200 hover:bg-[#0f0f0f] ${
      alert.status === 'new' ? 'bg-[#0a0a0a]' : 'bg-transparent'
    }`}
  >
    <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${alert.status === 'new' ? 'bg-emerald-400' : 'bg-slate-700'}`} />
    <div className="flex-1 min-w-0">
      <p className={`text-sm truncate ${alert.status === 'new' ? 'font-semibold text-white' : 'font-normal text-slate-400'}`}>
        {safeToString(alert.title)}
      </p>
      <p className="text-xs text-slate-600 truncate mt-0.5">{safeToString(alert.content || alert.description)}</p>
    </div>
    <div className="hidden sm:block flex-shrink-0">
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide ${PRIORITY_STYLE[alert.priority] || PRIORITY_STYLE.LOW}`}>
        {alert.priority}
      </span>
    </div>
    <div className="hidden md:block flex-shrink-0 w-28 text-right">
    <span className="text-xs text-slate-600">{formatRelativeTime(alert.created_at || alert.timestamp || alert.createdAt)}</span>
    </div>
  </button>
));
AlertRow.displayName = 'AlertRow';

export const AlertHistory = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [rawSearch, setRawSearch] = useState(searchParams.get('q') || '');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState({});

  const debouncedSearch = useDebounce(rawSearch, 450);
  const priority = searchParams.get('priority') || '';
  const status = searchParams.get('status') || '';
  const entity = searchParams.get('entity') || '';
  const startDate = searchParams.get('dateFrom') || '';
  const endDate = searchParams.get('dateTo') || '';

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) next.set('q', debouncedSearch); else next.delete('q');
    next.set('page', String(page));
    setSearchParams(next, { replace: true });
  }, [debouncedSearch, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const filters = useMemo(
    () => ({
      ...(debouncedSearch ? { q: debouncedSearch } : {}),
      ...(priority ? { priority } : {}),
      ...(status ? { status } : {}),
      ...(entity ? { entity } : {}),
      ...(startDate ? { start_date: startDate } : {}),
      ...(endDate ? { end_date: endDate } : {}),
    }),
    [debouncedSearch, priority, status, entity, startDate, endDate]
  );

  const hasFilters = Boolean(debouncedSearch || priority || status || entity || startDate || endDate);

  const { data, isLoading, isFetching, isError, refetch } = usePaginatedAlerts({
    page,
    limit: PAGE_SIZE,
    ...filters,
  });

  const { mutate: markRead } = useMarkAsRead();
  const { mutate: dismiss } = useDismissAlert();

  const alerts = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const setParam = useCallback((key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.set('page', '1');
    setPage(1);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    setRawSearch('');
    setPage(1);
    setSearchParams({ page: '1' }, { replace: true });
  }, [setSearchParams]);

  const handleSelect = useCallback((alert) => {
    const alertId = alert.alert_id ?? alert.id;
    setSelectedAlert(alert);
    setSelectedIndex(alerts.findIndex((a) => (a.alert_id ?? a.id) === alertId));
    markRead(alertId);
  }, [alerts, markRead]);

  const handleNav = useCallback((dir) => {
    if (selectedIndex === null) return;
    const next = selectedIndex + dir;
    if (next < 0 || next >= alerts.length) return;
    const target = alerts[next];
    setSelectedAlert(target);
    setSelectedIndex(next);
    markRead(target.alert_id ?? target.id);
  }, [selectedIndex, alerts, markRead]);

  const handleDismiss = useCallback((id) => {
    dismiss(id, {
      onSuccess: () => toast.success('Alert dismissed'),
      onError: () => toast.error('Failed to dismiss alert'),
    });
    setSelectedAlert(null);
  }, [dismiss, toast]);

  const handleFeedback = useCallback(async (alertId, sentiment, comment = '') => {
    if (!user?.id) return;
    if (feedbackMap[alertId]?.submitted) return;

    try {
      await feedbackService.submitFeedback({
        alertId,
        userId: user.id,
        sentiment,
        comment,
      });
      setFeedbackMap((prev) => ({ ...prev, [alertId]: { submitted: true } }));
      toast.success('Feedback submitted');
    } catch (error) {
      toast.error(error?.message || 'Feedback submission failed');
    }
  }, [feedbackMap, toast, user?.id]);

  const handleExportCsv = useCallback(async () => {
    try {
      setIsExporting(true);
      // Use server-side CSV export endpoint
      await alertsService.exportAlerts({
        ...(filters.priority ? { priority: filters.priority } : {}),
        ...(filters.start_date ? { start_date: filters.start_date } : {}),
        ...(filters.end_date ? { end_date: filters.end_date } : {}),
      });
      toast.success('CSV exported');
    } catch (error) {
      toast.error('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  }, [filters, toast]);

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-white">Alert History</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isLoading ? 'Loading…' : `${total} alert${total !== 1 ? 's' : ''} in last 30 days`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content="Refresh alerts" placement="bottom">
              <button onClick={() => refetch()} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-[#151515] border border-transparent hover:border-[#222] transition-all" aria-label="Refresh alerts">
                <RefreshCw className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Download filtered alerts as CSV" placement="bottom">
              <button onClick={handleExportCsv} disabled={isExporting} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-[#0d0d0d] border-[#1f1f1f] text-slate-400 hover:border-[#2a2a2a] hover:text-white transition-all disabled:opacity-50">
                <Download className="w-3.5 h-3.5" />
                {isExporting ? 'Exporting…' : 'Export CSV'}
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 transition-all duration-200">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input type="text" placeholder="Search alerts…" value={rawSearch} onChange={(e) => setRawSearch(e.target.value)} className="w-full pl-9 pr-9 py-2 rounded-xl text-sm bg-[#0d0d0d] border border-[#1f1f1f] text-white placeholder-slate-600 focus:outline-none focus:border-[#333]" />
            {rawSearch && <button onClick={() => setRawSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>}
          </div>

          <input type="date" value={startDate} onChange={(e) => setParam('dateFrom', e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm bg-[#0d0d0d] border border-[#1f1f1f] text-white" />
          <input type="date" value={endDate} onChange={(e) => setParam('dateTo', e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm bg-[#0d0d0d] border border-[#1f1f1f] text-white" />

          <input type="text" placeholder="Entity (BTC, ETH…)" value={entity} onChange={(e) => setParam('entity', e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm bg-[#0d0d0d] border border-[#1f1f1f] text-white placeholder-slate-600" />

          <div className="flex gap-2">
            <select value={priority} onChange={(e) => setParam('priority', e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm bg-[#0d0d0d] border border-[#1f1f1f] text-white">
              <option value="">Priority</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
            <select value={status} onChange={(e) => setParam('status', e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm bg-[#0d0d0d] border border-[#1f1f1f] text-white">
              <option value="">Status</option>
              <option value="new">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="flex justify-end">
            <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-white transition-colors">Clear all filters</button>
          </div>
        )}

        <div className="rounded-xl border border-[#1a1a1a] overflow-hidden bg-[#080808] transition-opacity duration-200">
          <div className="hidden sm:flex items-center gap-4 px-4 py-2.5 border-b border-[#161616] bg-[#0a0a0a]">
            <div className="w-1.5 flex-shrink-0" />
            <div className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Alert</div>
            <div className="w-20 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Priority</div>
            <div className="w-28 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-600">Time</div>
          </div>

          {isLoading || isFetching ? (
            Array.from({ length: 8 }).map((_, index) => <SkeletonRow key={index} />)
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-8">
              <p className="text-sm text-slate-500">Failed to load alerts.</p>
              <button onClick={() => refetch()} className="px-4 py-2 text-xs font-medium rounded-lg bg-[#151515] border border-[#222] text-slate-400 hover:text-white hover:border-[#333] transition-colors">Retry</button>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-8">
              <p className="text-sm font-medium text-slate-500 mb-1">No alerts found</p>
              <p className="text-xs text-slate-600 mb-5">Try adjusting filters or date range.</p>
            </div>
          ) : (
            alerts.map((alert) => <AlertRow key={alert.alert_id ?? alert.id} alert={alert} onSelect={handleSelect} />)
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-600">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextPage = Math.max(1, page - 1);
                setPage(nextPage);
                const next = new URLSearchParams(searchParams);
                next.set('page', String(nextPage));
                setSearchParams(next, { replace: true });
              }}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs rounded-lg bg-[#151515] border border-[#222] text-slate-400 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => {
                const nextPage = Math.min(totalPages, page + 1);
                setPage(nextPage);
                const next = new URLSearchParams(searchParams);
                next.set('page', String(nextPage));
                setSearchParams(next, { replace: true });
              }}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-xs rounded-lg bg-[#151515] border border-[#222] text-slate-400 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <AlertDetailModal
        alert={selectedAlert}
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onMarkAsRead={(id) => markRead(id)}
        onDismiss={handleDismiss}
        onPrev={selectedIndex > 0 ? () => handleNav(-1) : null}
        onNext={selectedIndex !== null && selectedIndex < alerts.length - 1 ? () => handleNav(1) : null}
        onFeedback={handleFeedback}
        feedbackState={selectedAlert ? feedbackMap[selectedAlert.id] : null}
      />
    </div>
  );
};

export default AlertHistory;
