import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Bell,
  Database,
  BarChart3,
  Bookmark,
  Settings,
  Menu,
  Search,
  ChevronDown,
  RefreshCw,
  Pin,
  AlertCircle,
  TrendingUp,
  Newspaper,
  Activity,
  Filter,
  X,
  Loader2,
  ExternalLink,
  Star,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { AlertDetailModal } from '@components/dashboard/AlertDetailModal';
import { useSocket } from '@hooks/useSocket';
import { WS_EVENTS } from '@utils/constants';
import { useAuth } from '@hooks/useAuth';
import { useToast } from '@hooks/useToast';
import feedbackService from '@services/feedbackService';
import alertsService from '@services/alertsService';
import eventsService from '@services/eventsService';
import { formatRelativeTime } from '@utils/helpers';

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };
const FALLBACK_SOURCE_OPTIONS = ['CoinDesk', 'CoinTelegraph', 'Decrypt', 'CoinGecko'];
const SOURCE_QUERY_BY_LABEL = {
  CoinDesk: 'coindesk',
  CoinTelegraph: 'cointelegraph',
  Decrypt: 'decrypt.co',
  CoinGecko: 'coingecko',
};
const MOBILE_TABS = ['alerts', 'sources', 'analytics', 'saved', 'settings'];

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'alerts', label: 'Alerts', icon: Bell },
  { key: 'sources', label: 'Data Sources', icon: Database },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'saved', label: 'Saved Alerts', icon: Bookmark },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const ALERT_TYPE_OPTIONS = ['all', 'NEWS', 'PRICE_ALERT', 'SENTIMENT'];
const TIME_RANGE_OPTIONS = ['1h', '6h', '24h', '7d'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Time' },
  { value: 'priority', label: 'Priority' },
  { value: 'relevance', label: 'Relevance' },
];

const DEFAULT_FILTERS = {
  priority: ['HIGH', 'MEDIUM', 'LOW'],
  eventType: 'all',
  entity: '',
  sources: [],
  timeRange: '24h',
};

const normalizeStatus = (status) => {
  if (status === 'pending') return 'new';
  return status || 'new';
};

const toDisplayText = (value, fallback = '') => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    const joined = value
      .map((item) => (typeof item === 'string' ? item.trim() : String(item ?? '')))
      .filter(Boolean)
      .join(', ');
    return joined || fallback;
  }
  if (value && typeof value === 'object') {
    const candidate = value.summary || value.title || value.name || value.link || value.description;
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return fallback;
};

const normalizeSourceName = (source) => {
  const raw = String(source || '').trim().toLowerCase();
  if (!raw) return '';
  if (raw.includes('coindesk')) return 'CoinDesk';
  if (raw.includes('cointelegraph')) return 'CoinTelegraph';
  if (raw.includes('decrypt')) return 'Decrypt';
  if (raw.includes('coingecko')) return 'CoinGecko';
  return '';
};

const toApiSourceParam = (sourceLabel) => SOURCE_QUERY_BY_LABEL[sourceLabel] || '';
const isEventItemId = (id) => String(id).startsWith('event-');

const inferAlertType = (alert) => {
  const type = String(alert?.event_type || '').toUpperCase();
  if (type.includes('PRICE')) return 'PRICE_ALERT';
  const text = `${alert?.title || ''} ${alert?.content || ''}`.toLowerCase();
  if (text.includes('sentiment') || text.includes('fear') || text.includes('greed')) return 'SENTIMENT';
  return 'NEWS';
};

const parseTimeRangeHours = (range) => {
  if (range === '1h') return 1;
  if (range === '6h') return 6;
  if (range === '24h') return 24;
  return 24 * 7;
};

const normalizeAlert = (alert) => ({
  id: alert.alert_id ?? alert.id,
  alert_id: alert.alert_id ?? alert.id,
  event_type: toDisplayText(alert.event_type, 'NEWS').toUpperCase(),
  source: toDisplayText(alert.source, 'Unknown'),
  title: toDisplayText(alert.title, 'Untitled Alert'),
  content: toDisplayText(
    alert.content,
    toDisplayText(alert.description, toDisplayText(alert.title, 'No details provided'))
  ),
  priority: alert.priority || 'LOW',
  status: normalizeStatus(alert.status),
  timestamp: alert.created_at || alert.timestamp || alert.createdAt || new Date().toISOString(),
  entity: toDisplayText(alert.entity, ''),
  rawContent: alert.rawContent || null,
});

const normalizeNewsEvent = (event) => {
  const content = event?.content || {};
  const title = toDisplayText(
    content.title,
    toDisplayText(content.name, `News from ${toDisplayText(event?.source, 'source')}`)
  );
  const body = toDisplayText(
    content.summary,
    toDisplayText(content.alert_reasons, toDisplayText(content.link, 'No details provided'))
  );

  return {
    id: `event-${event?.id}`,
    event_id: event?.id,
    event_type: String(event?.type || 'news').toUpperCase(),
    source: toDisplayText(event?.source, 'unknown'),
    title,
    content: body,
    priority: content.quality_score >= 70 ? 'HIGH' : content.quality_score >= 50 ? 'MEDIUM' : 'LOW',
    status: 'new',
    timestamp: event?.timestamp || new Date().toISOString(),
    entity: toDisplayText(content.id, toDisplayText(content.symbol, toDisplayText(content.name, ''))),
    rawContent: {
      ...content,
      type: event?.type,
    },
  };
};

const mergeAlertsPreservingReadState = (previousAlerts, incomingAlerts, readIdsSet) => {
  const prevById = new Map((previousAlerts || []).map((item) => [String(item.id), item]));

  return (incomingAlerts || []).map((item) => {
    const key = String(item.id);
    const previous = prevById.get(key);
    const shouldKeepRead = readIdsSet.has(key) || previous?.status === 'read';

    return {
      ...item,
      status: shouldKeepRead ? 'read' : item.status,
    };
  });
};

const priorityStyles = {
  HIGH: 'border-l-red-500 bg-red-500/10 text-red-300',
  MEDIUM: 'border-l-amber-500 bg-amber-500/10 text-amber-300',
  LOW: 'border-l-blue-500 bg-blue-500/10 text-blue-300',
};

const AlertFeedCard = ({
  alert,
  isPinned,
  isBookmarked,
  isImportant,
  onOpen,
  onBookmark,
  onPin,
  onImportant,
}) => {
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const type = inferAlertType(alert);
  const sourceLabel = normalizeSourceName(alert.source) || alert.source;

  const handleTouchEnd = () => {
    if (touchStartX == null || touchEndX == null) return;
    const diff = touchStartX - touchEndX;
    if (diff > 60) onBookmark(alert.id);
    if (diff < -60) onImportant(alert.id);
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <article
      onTouchStart={(e) => setTouchStartX(e.changedTouches[0].clientX)}
      onTouchMove={(e) => setTouchEndX(e.changedTouches[0].clientX)}
      onTouchEnd={handleTouchEnd}
      className="rounded-lg border border-white/5 bg-[#1e293b] shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <button
        type="button"
        onClick={() => onOpen(alert)}
        className={`w-full text-left p-3 sm:p-4 border-l-2 ${priorityStyles[alert.priority] || priorityStyles.LOW}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-200">
              {String(sourceLabel).slice(0, 2).toUpperCase()}
            </div>
            <span className="text-xs text-slate-300 font-semibold truncate">{sourceLabel}</span>
          </div>
          <span className="text-[11px] text-slate-400 whitespace-nowrap">{formatRelativeTime(alert.timestamp)}</span>
        </div>

        <h3 className="mt-2 text-sm sm:text-base font-semibold text-slate-100 line-clamp-2">{alert.title}</h3>
        <p className="mt-1 text-xs sm:text-sm text-slate-400 line-clamp-2">{alert.content}</p>

        <div className="mt-3 flex items-center flex-wrap gap-1.5">
          {alert.entity && (
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-300 border border-white/10">
              {alert.entity}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-[11px] text-blue-300 border border-blue-400/20">
            {type === 'PRICE_ALERT' ? 'Price' : type === 'SENTIMENT' ? 'Sentiment' : 'News'}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-200 border border-white/10">
            {alert.priority}
          </span>
          {isPinned && <span className="text-[10px] text-green-400">Pinned</span>}
          {isImportant && <span className="text-[10px] text-orange-400">Important</span>}
          {isBookmarked && <span className="text-[10px] text-blue-400">Saved</span>}
        </div>
      </button>

      <div className="px-3 pb-3 sm:px-4 sm:pb-4 flex items-center gap-2 flex-wrap">
        {alert.rawContent?.link && (
          <a
            href={alert.rawContent.link}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3 inline-flex items-center gap-1 rounded-md border border-white/10 text-xs text-slate-300 hover:bg-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
            Source
          </a>
        )}
        <button
          type="button"
          onClick={() => onBookmark(alert.id)}
          className={`h-9 px-3 inline-flex items-center gap-1 rounded-md border text-xs transition-colors ${
            isBookmarked ? 'border-blue-400/30 text-blue-300 bg-blue-500/10' : 'border-white/10 text-slate-300 hover:bg-white/5'
          }`}
        >
          <Bookmark className="w-3 h-3" />
          Bookmark
        </button>
        <button
          type="button"
          onClick={() => onImportant(alert.id)}
          className={`h-9 px-3 inline-flex items-center gap-1 rounded-md border text-xs transition-colors ${
            isImportant ? 'border-orange-400/30 text-orange-300 bg-orange-500/10' : 'border-white/10 text-slate-300 hover:bg-white/5'
          }`}
        >
          <Star className="w-3 h-3" />
          Important
        </button>
        <button
          type="button"
          onClick={() => onPin(alert.id)}
          className={`h-9 px-3 inline-flex items-center gap-1 rounded-md border text-xs transition-colors ${
            isPinned ? 'border-green-400/30 text-green-300 bg-green-500/10' : 'border-white/10 text-slate-300 hover:bg-white/5'
          }`}
        >
          <Pin className="w-3 h-3" />
          Pin
        </button>
      </div>
    </article>
  );
};

AlertFeedCard.propTypes = {
  alert: PropTypes.object.isRequired,
  isPinned: PropTypes.bool.isRequired,
  isBookmarked: PropTypes.bool.isRequired,
  isImportant: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onBookmark: PropTypes.func.isRequired,
  onPin: PropTypes.func.isRequired,
  onImportant: PropTypes.func.isRequired,
};

const KpiTile = ({ label, value, trend, icon: Icon, accent }) => (
  <div className="rounded-lg bg-[#1e293b] border border-white/5 p-4 shadow-md">
    <div className="flex items-center justify-between">
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <Icon className={`w-4 h-4 ${accent}`} />
    </div>
    <div className="mt-2 flex items-end justify-between">
      <p className="text-2xl font-bold text-[#e2e8f0]">{value}</p>
      <span className="text-xs text-green-400">{trend}</span>
    </div>
  </div>
);

KpiTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trend: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  accent: PropTypes.string.isRequired,
};

const MiniActivityChart = ({ byHour }) => {
  const max = Math.max(...byHour.map((v) => v.count), 1);
  return (
    <div className="h-40 flex items-end gap-1.5">
      {byHour.map((entry) => (
        <div key={entry.label} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-sm bg-blue-500/50 hover:bg-blue-400 transition-colors"
            style={{ height: `${Math.max(8, (entry.count / max) * 100)}%` }}
            title={`${entry.label}: ${entry.count}`}
          />
          <span className="text-[10px] text-slate-500">{entry.label}</span>
        </div>
      ))}
    </div>
  );
};

MiniActivityChart.propTypes = {
  byHour: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })
  ).isRequired,
};

const TypeDistributionChart = ({ data }) => {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0) || 1;
  const rows = [
    { key: 'NEWS', label: 'News', color: 'bg-blue-500', value: data.NEWS || 0 },
    { key: 'PRICE_ALERT', label: 'Price', color: 'bg-green-500', value: data.PRICE_ALERT || 0 },
    { key: 'SENTIMENT', label: 'Sentiment', color: 'bg-orange-500', value: data.SENTIMENT || 0 },
  ];

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.key}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
          <div className="h-2 rounded bg-slate-800 overflow-hidden">
            <div className={`${row.color} h-2`} style={{ width: `${(row.value / total) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

TypeDistributionChart.propTypes = {
  data: PropTypes.shape({
    NEWS: PropTypes.number,
    PRICE_ALERT: PropTypes.number,
    SENTIMENT: PropTypes.number,
  }).isRequired,
};

const SourceTile = ({ source, count, enabled, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`rounded-lg border p-3 text-left transition-all min-h-[44px] ${
      enabled
        ? 'bg-green-500/10 border-green-400/30 shadow-md'
        : 'bg-[#1e293b] border-white/5 hover:border-white/15'
    }`}
  >
    <div className="flex items-center justify-between gap-2">
      <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[11px] font-bold text-slate-200">
        {source.slice(0, 2).toUpperCase()}
      </div>
      <span className={`h-2.5 w-2.5 rounded-full ${enabled ? 'bg-green-400' : 'bg-slate-600'}`} />
    </div>
    <p className="mt-2 text-sm text-slate-100 font-medium truncate">{source}</p>
    <p className="text-xs text-slate-400">{count} alerts</p>
  </button>
);

SourceTile.propTypes = {
  source: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  enabled: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

const SkeletonList = () => (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, idx) => (
      <div key={idx} className="h-28 rounded-lg bg-[#1e293b] border border-white/5 animate-pulse" />
    ))}
  </div>
);

export const Dashboard = () => {
  const queryClient = useQueryClient();
  const { on } = useSocket({ autoConnect: true });
  const { user } = useAuth();
  const toast = useToast();

  const [allAlerts, setAllAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [sourceOptions, setSourceOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadError, setLoadError] = useState('');

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeDesktopNav, setActiveDesktopNav] = useState('dashboard');
  const [mobileTab, setMobileTab] = useState('alerts');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [panelState, setPanelState] = useState({ feed: true, sources: true, activity: true });

  const [pinnedIds, setPinnedIds] = useState(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [importantIds, setImportantIds] = useState(new Set());
  const [feedbackMap, setFeedbackMap] = useState({});
  const [recentAlertIds, setRecentAlertIds] = useState(new Set());

  const toastRef = useRef(toast);
  const hasShownLoadErrorRef = useRef(false);
  const readAlertIdsRef = useRef(new Set());
  const feedRef = useRef(null);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const toggleSetValue = (setter, id) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const loadDashboardData = useCallback(async (selectedSources = [], eventType = 'all') => {
    setIsLoading(true);
    setLoadError('');

    try {
      const sourceApiParams = Array.from(new Set((selectedSources || []).map(toApiSourceParam).filter(Boolean)));

      let apiSources = [];
      try {
        apiSources = await eventsService.getAvailableSources({ limit: 200 });
      } catch {
        apiSources = [];
      }

      let feedResult = [];
      let feedError = null;

      try {
        if (sourceApiParams.length > 0) {
          const type = eventType === 'PRICE_ALERT' ? 'price' : eventType === 'NEWS' ? 'news' : undefined;
          const results = await Promise.all(
            sourceApiParams.map((source) => eventsService.getEvents({ skip: 0, limit: 100, source, type }))
          );
          feedResult = results.flat().filter(Boolean);
        } else if (eventType === 'NEWS') {
          feedResult = await eventsService.getEventsByType('news', { skip: 0, limit: 100 });
        } else if (eventType === 'PRICE_ALERT') {
          feedResult = await eventsService.getEventsByType('price', { skip: 0, limit: 100 });
        } else {
          feedResult = await alertsService.getAlerts({ skip: 0, limit: 100 });
        }
      } catch (error) {
        feedError = error;
      }

      const normalizedAlerts =
        sourceApiParams.length > 0 || (eventType !== 'all' && !sourceApiParams.length)
          ? (feedResult || []).flat().filter(Boolean).map(normalizeNewsEvent)
          : (feedResult || []).map(normalizeAlert);

      setAllAlerts((prev) => {
        const merged = mergeAlertsPreservingReadState(prev, normalizedAlerts, readAlertIdsRef.current);
        const sourcesFromAlerts = merged.map((item) => normalizeSourceName(item.source)).filter(Boolean);
        const mergedSources = Array.from(
          new Set([...(apiSources || []), ...sourcesFromAlerts, ...FALLBACK_SOURCE_OPTIONS].map(normalizeSourceName).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b));

        setSourceOptions(mergedSources);
        return merged;
      });

      if (feedError && normalizedAlerts.length === 0) {
        setLoadError(feedError?.message || 'No alerts found for selected filters');
      }

      hasShownLoadErrorRef.current = false;
    } catch (error) {
      const message = error?.message || 'Failed to load dashboard';
      setLoadError(message);
      if (!hasShownLoadErrorRef.current) {
        toastRef.current.error(message);
        hasShownLoadErrorRef.current = true;
      }
      setAllAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData(appliedFilters.sources || [], appliedFilters.eventType || 'all');
  }, [loadDashboardData, appliedFilters.sources, appliedFilters.eventType]);

  useEffect(() => {
    const handleIncomingAlert = (incoming) => {
      const normalized = normalizeAlert(incoming || {});
      if (!normalized?.id) return;

      setAllAlerts((prev) => {
        if (prev.some((item) => item.id === normalized.id)) return prev;
        return [normalized, ...prev];
      });

      setRecentAlertIds((prev) => {
        const next = new Set(prev);
        next.add(normalized.id);
        return next;
      });

      setTimeout(() => {
        setRecentAlertIds((prev) => {
          const next = new Set(prev);
          next.delete(normalized.id);
          return next;
        });
      }, 1800);

      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    };

    const unsubNewAlert = on(WS_EVENTS.NEW_ALERT, handleIncomingAlert);
    const unsubAlert = on('alert', handleIncomingAlert);

    return () => {
      if (typeof unsubNewAlert === 'function') unsubNewAlert();
      if (typeof unsubAlert === 'function') unsubAlert();
    };
  }, [on, queryClient]);

  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 120 && !isLoadingMore) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount((prev) => prev + 6);
          setIsLoadingMore(false);
        }, 500);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore]);

  const sourceCounts = useMemo(() => {
    const counts = {};
    allAlerts.forEach((alert) => {
      const key = normalizeSourceName(alert.source) || alert.source;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [allAlerts]);

  const filteredAlerts = useMemo(() => {
    const now = Date.now();
    const hours = parseTimeRangeHours(appliedFilters.timeRange || '24h');
    const threshold = now - hours * 60 * 60 * 1000;

    let list = allAlerts.filter((alert) => {
      const ts = new Date(alert.timestamp).getTime();
      if (Number.isNaN(ts)) return true;
      return ts >= threshold;
    });

    if ((appliedFilters.sources || []).length > 0) {
      const selected = new Set((appliedFilters.sources || []).map((item) => item.toLowerCase()));
      list = list.filter((alert) => selected.has((normalizeSourceName(alert.source) || '').toLowerCase()));
    }

    if (appliedFilters.eventType && appliedFilters.eventType !== 'all') {
      list = list.filter((alert) => inferAlertType(alert) === appliedFilters.eventType);
    }

    if (appliedFilters.entity) {
      const term = appliedFilters.entity.toLowerCase();
      list = list.filter(
        (alert) =>
          (alert.title || '').toLowerCase().includes(term) ||
          (alert.content || '').toLowerCase().includes(term) ||
          (alert.entity || '').toLowerCase().includes(term)
      );
    }

    if (searchQuery.trim()) {
      const term = searchQuery.trim().toLowerCase();
      list = list.filter(
        (alert) =>
          (alert.title || '').toLowerCase().includes(term) ||
          (alert.content || '').toLowerCase().includes(term) ||
          (alert.source || '').toLowerCase().includes(term)
      );
    }

    const sorted = [...list];
    if (sortBy === 'priority') {
      sorted.sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority] ?? 9;
        const pb = PRIORITY_ORDER[b.priority] ?? 9;
        if (pa !== pb) return pa - pb;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
    } else if (sortBy === 'relevance') {
      sorted.sort((a, b) => {
        const score = (item) => {
          let s = 0;
          if (importantIds.has(item.id)) s += 30;
          if (pinnedIds.has(item.id)) s += 20;
          if (bookmarkedIds.has(item.id)) s += 10;
          s += item.status === 'new' ? 8 : 0;
          s += (3 - (PRIORITY_ORDER[item.priority] ?? 3)) * 5;
          return s;
        };
        return score(b) - score(a);
      });
    } else {
      sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    sorted.sort((a, b) => {
      if (pinnedIds.has(a.id) && !pinnedIds.has(b.id)) return -1;
      if (!pinnedIds.has(a.id) && pinnedIds.has(b.id)) return 1;
      return 0;
    });

    return sorted;
  }, [
    allAlerts,
    appliedFilters,
    searchQuery,
    sortBy,
    bookmarkedIds,
    importantIds,
    pinnedIds,
  ]);

  const visibleAlerts = filteredAlerts.slice(0, visibleCount);
  const savedAlerts = filteredAlerts.filter((item) => bookmarkedIds.has(item.id));

  const kpis = useMemo(() => {
    const types = { NEWS: 0, PRICE_ALERT: 0, SENTIMENT: 0 };
    filteredAlerts.forEach((alert) => {
      types[inferAlertType(alert)] = (types[inferAlertType(alert)] || 0) + 1;
    });
    return {
      total: filteredAlerts.length,
      news: types.NEWS,
      price: types.PRICE_ALERT,
      sentiment: types.SENTIMENT,
      types,
    };
  }, [filteredAlerts]);

  const byHour = useMemo(() => {
    const now = new Date();
    const points = [];
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      const label = `${d.getHours().toString().padStart(2, '0')}:00`;
      points.push({ label, count: 0, hour: d.getHours(), day: d.getDate() });
    }

    filteredAlerts.forEach((alert) => {
      const t = new Date(alert.timestamp);
      const idx = points.findIndex((p) => p.hour === t.getHours() && p.day === t.getDate());
      if (idx >= 0) points[idx].count += 1;
    });

    return points;
  }, [filteredAlerts]);

  const handleMarkAsRead = useCallback(async (id) => {
    readAlertIdsRef.current.add(String(id));
    setAllAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'read' } : a)));
    if (isEventItemId(id)) return;
    try {
      await alertsService.markAsRead(id);
    } catch (error) {
      toast.error(error?.message || 'Failed to mark alert as read');
    }
  }, [toast]);

  const handleOpenAlert = useCallback((alert) => {
    readAlertIdsRef.current.add(String(alert.id));
    setSelectedAlert({ ...alert, status: 'read' });
    setAllAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, status: 'read' } : a)));
    if (!isEventItemId(alert.id)) {
      alertsService.markAsRead(alert.id).catch(() => undefined);
    }
  }, []);

  const handleDismiss = useCallback(async (id) => {
    const previous = allAlerts;
    setAllAlerts((prev) => prev.filter((a) => a.id !== id));
    setSelectedAlert(null);
    if (isEventItemId(id)) return;
    try {
      await alertsService.dismissAlert(id);
    } catch (error) {
      setAllAlerts(previous);
      toast.error(error?.message || 'Failed to dismiss alert');
    }
  }, [allAlerts, toast]);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData(appliedFilters.sources || [], appliedFilters.eventType || 'all');
    setIsRefreshing(false);
  };

  const toggleSource = (source) => {
    const current = new Set(filters.sources || []);
    if (current.has(source)) current.delete(source);
    else current.add(source);
    const next = { ...filters, sources: Array.from(current) };
    setFilters(next);
    setAppliedFilters(next);
    setVisibleCount(10);
  };

  const applyFilterNow = (patch) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    setAppliedFilters(next);
    setVisibleCount(10);
  };

  const topFilters = (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center bg-[#1e293b] border border-white/5 rounded-md p-1">
        {ALERT_TYPE_OPTIONS.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => applyFilterNow({ eventType: type })}
            className={`h-8 px-2.5 rounded text-xs font-medium transition-colors ${
              (appliedFilters.eventType || 'all') === type
                ? 'bg-blue-500 text-white'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            {type === 'all' ? 'All' : type === 'PRICE_ALERT' ? 'Price' : type === 'SENTIMENT' ? 'Sentiment' : 'News'}
          </button>
        ))}
      </div>

      <div className="flex items-center bg-[#1e293b] border border-white/5 rounded-md p-1">
        {TIME_RANGE_OPTIONS.map((range) => (
          <button
            key={range}
            type="button"
            onClick={() => applyFilterNow({ timeRange: range })}
            className={`h-8 px-2.5 rounded text-xs font-medium transition-colors ${
              (appliedFilters.timeRange || '24h') === range
                ? 'bg-green-500 text-slate-900'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="h-8 rounded-md bg-[#1e293b] border border-white/5 px-2 text-xs text-slate-200"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const feedPanel = (
    <section className="rounded-lg bg-[#1e293b] border border-white/5 overflow-hidden">
      <header className="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[#e2e8f0]">Live Alert Feed</h2>
          <p className="text-xs text-[#94a3b8]">{filteredAlerts.length} signals in range</p>
        </div>
        <button
          type="button"
          onClick={() => setPanelState((prev) => ({ ...prev, feed: !prev.feed }))}
          className="h-8 px-2 rounded-md border border-white/10 text-slate-300 text-xs"
        >
          {panelState.feed ? 'Collapse' : 'Expand'}
        </button>
      </header>

      {panelState.feed && (
        <div ref={feedRef} className="p-3 sm:p-4 max-h-[58vh] overflow-y-auto space-y-2">
          {isLoading ? (
            <SkeletonList />
          ) : loadError ? (
            <div className="rounded-lg border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">{loadError}</div>
          ) : visibleAlerts.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-slate-900/30 p-6 text-center text-sm text-slate-400">
              No alerts for current filters.
            </div>
          ) : (
            visibleAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`transition-all ${recentAlertIds.has(alert.id) ? 'ring-1 ring-blue-400/40 rounded-lg' : ''}`}
              >
                <AlertFeedCard
                  alert={alert}
                  isPinned={pinnedIds.has(alert.id)}
                  isBookmarked={bookmarkedIds.has(alert.id)}
                  isImportant={importantIds.has(alert.id)}
                  onOpen={handleOpenAlert}
                  onBookmark={(id) => toggleSetValue(setBookmarkedIds, id)}
                  onPin={(id) => toggleSetValue(setPinnedIds, id)}
                  onImportant={(id) => toggleSetValue(setImportantIds, id)}
                />
              </div>
            ))
          )}

          {isLoadingMore && (
            <div className="h-10 flex items-center justify-center text-slate-400 text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
        </div>
      )}
    </section>
  );

  const sourcePanel = (
    <section className="rounded-lg bg-[#1e293b] border border-white/5 overflow-hidden">
      <header className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#e2e8f0]">Data Sources</h2>
          <p className="text-xs text-[#94a3b8]">Toggle providers on/off</p>
        </div>
        <button
          type="button"
          onClick={() => setPanelState((prev) => ({ ...prev, sources: !prev.sources }))}
          className="h-8 px-2 rounded-md border border-white/10 text-slate-300 text-xs"
        >
          {panelState.sources ? 'Collapse' : 'Expand'}
        </button>
      </header>

      {panelState.sources && (
        <div className="p-3 grid grid-cols-2 xl:grid-cols-1 gap-2">
          {sourceOptions.map((source) => (
            <SourceTile
              key={source}
              source={source}
              count={sourceCounts[source] || 0}
              enabled={(appliedFilters.sources || []).length === 0 || (appliedFilters.sources || []).includes(source)}
              onToggle={() => toggleSource(source)}
            />
          ))}
        </div>
      )}
    </section>
  );

  const analyticsPanel = (
    <section className="rounded-lg bg-[#1e293b] border border-white/5 overflow-hidden">
      <header className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#e2e8f0]">Activity Chart</h2>
          <p className="text-xs text-[#94a3b8]">Alerts per hour and type distribution</p>
        </div>
        <button
          type="button"
          onClick={() => setPanelState((prev) => ({ ...prev, activity: !prev.activity }))}
          className="h-8 px-2 rounded-md border border-white/10 text-slate-300 text-xs"
        >
          {panelState.activity ? 'Collapse' : 'Expand'}
        </button>
      </header>

      {panelState.activity && (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg bg-slate-900/30 border border-white/5 p-3">
            <p className="text-xs text-slate-400 mb-2">Alerts per hour</p>
            <MiniActivityChart byHour={byHour} />
          </div>
          <div className="rounded-lg bg-slate-900/30 border border-white/5 p-3">
            <p className="text-xs text-slate-400 mb-2">Distribution by type</p>
            <TypeDistributionChart data={kpis.types} />
          </div>
        </div>
      )}
    </section>
  );

  const desktopView = (
    <div className="hidden lg:grid grid-cols-[auto_1fr] min-h-screen bg-[#0f172a] text-[#e2e8f0]">
      <aside className={`border-r border-white/5 bg-[#111b2f] transition-all ${sidebarCollapsed ? 'w-[76px]' : 'w-[240px]'}`}>
        <div className="h-16 px-4 border-b border-white/5 flex items-center justify-between">
          {!sidebarCollapsed && <span className="font-semibold tracking-wide">Aeterna Intel</span>}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="h-8 w-8 rounded-md border border-white/10 grid place-items-center text-slate-300 hover:bg-white/5"
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeDesktopNav === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveDesktopNav(item.key)}
                className={`w-full h-10 px-3 rounded-md flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} gap-2 text-sm transition-all ${
                  active ? 'bg-blue-500/15 text-blue-300 border border-blue-400/20' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0">
        <header className="h-16 px-6 border-b border-white/5 bg-[#0f172a]/95 backdrop-blur sticky top-0 z-20 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search alerts, tokens, sources"
              className="w-full h-10 pl-9 pr-3 rounded-md bg-[#1e293b] border border-white/5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-400/40"
            />
          </div>

          {topFilters}

          <div className="flex items-center gap-2">
            <button type="button" className="h-10 w-10 rounded-md border border-white/10 grid place-items-center text-slate-300 hover:bg-white/5">
              <Bell className="w-4 h-4" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu((v) => !v)}
                className="h-10 px-3 rounded-md border border-white/10 bg-[#1e293b] flex items-center gap-2 text-sm text-slate-200"
              >
                <span className="h-6 w-6 rounded-full bg-slate-700 grid place-items-center text-xs">{(user?.name || 'U')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border border-white/10 bg-[#1e293b] shadow-xl p-2 text-sm">
                  <button type="button" className="w-full text-left h-9 px-2 rounded hover:bg-white/5">Profile</button>
                  <button type="button" className="w-full text-left h-9 px-2 rounded hover:bg-white/5">Settings</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 xl:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <KpiTile label="Total Alerts Today" value={kpis.total} trend="+8.2%" icon={AlertCircle} accent="text-blue-400" />
            <KpiTile label="News Alerts" value={kpis.news} trend="+3.1%" icon={Newspaper} accent="text-blue-400" />
            <KpiTile label="Price Alerts" value={kpis.price} trend="+11.4%" icon={TrendingUp} accent="text-green-400" />
            <KpiTile label="Sentiment Alerts" value={kpis.sentiment} trend="+2.6%" icon={Activity} accent="text-orange-400" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
            <div className="space-y-4">
              {feedPanel}
              {analyticsPanel}
            </div>
            <div>{sourcePanel}</div>
          </div>
        </div>
      </main>
    </div>
  );

  const mobileHeader = (
    <header className="sticky top-0 z-20 bg-[#0f172a]/95 backdrop-blur border-b border-white/5 px-3 py-2.5 flex items-center justify-between">
      <h1 className="text-sm font-semibold text-slate-100">Market Dashboard</h1>
      <div className="flex items-center gap-1.5">
        <button type="button" className="h-10 w-10 rounded-md border border-white/10 grid place-items-center text-slate-300">
          <Search className="w-4 h-4" />
        </button>
        <button type="button" className="h-10 w-10 rounded-md border border-white/10 grid place-items-center text-slate-300">
          <Bell className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="h-10 w-10 rounded-md border border-white/10 grid place-items-center text-slate-300"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>
    </header>
  );

  const mobileTabBar = (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-[#111b2f] border-t border-white/5 h-16 grid grid-cols-5">
      {MOBILE_TABS.map((tab) => {
        const iconMap = {
          alerts: Bell,
          sources: Database,
          analytics: BarChart3,
          saved: Bookmark,
          settings: Settings,
        };
        const Icon = iconMap[tab];
        const active = mobileTab === tab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] ${active ? 'text-blue-300' : 'text-slate-400'}`}
          >
            <Icon className="w-4 h-4" />
            <span className="capitalize">{tab}</span>
          </button>
        );
      })}
    </nav>
  );

  const mobileAlertsView = (
    <div className="space-y-3 pb-24 px-3 pt-3">
      <div className="grid grid-cols-2 gap-2">
        <KpiTile label="Total" value={kpis.total} trend="+8%" icon={AlertCircle} accent="text-blue-400" />
        <KpiTile label="Price" value={kpis.price} trend="+11%" icon={TrendingUp} accent="text-green-400" />
      </div>

      {visibleAlerts.map((alert) => (
        <AlertFeedCard
          key={alert.id}
          alert={alert}
          isPinned={pinnedIds.has(alert.id)}
          isBookmarked={bookmarkedIds.has(alert.id)}
          isImportant={importantIds.has(alert.id)}
          onOpen={handleOpenAlert}
          onBookmark={(id) => toggleSetValue(setBookmarkedIds, id)}
          onPin={(id) => toggleSetValue(setPinnedIds, id)}
          onImportant={(id) => toggleSetValue(setImportantIds, id)}
        />
      ))}

      {isLoading && <SkeletonList />}

      <button
        type="button"
        onClick={() => setMobileFilterOpen(true)}
        className="fixed bottom-20 right-4 h-11 px-4 rounded-full bg-blue-500 text-white text-sm shadow-lg"
      >
        Quick Filter
      </button>
    </div>
  );

  const mobileSourcesView = (
    <div className="pb-24 px-3 pt-3">
      <div className="grid grid-cols-2 gap-2">
        {sourceOptions.map((source) => (
          <SourceTile
            key={source}
            source={source}
            count={sourceCounts[source] || 0}
            enabled={(appliedFilters.sources || []).length === 0 || (appliedFilters.sources || []).includes(source)}
            onToggle={() => toggleSource(source)}
          />
        ))}
      </div>
    </div>
  );

  const mobileAnalyticsView = (
    <div className="pb-24 px-3 pt-3">
      <div className="overflow-x-auto flex snap-x snap-mandatory gap-3">
        <div className="snap-start shrink-0 w-full rounded-lg bg-[#1e293b] border border-white/5 p-3">
          <p className="text-xs text-slate-400 mb-2">Alerts over time</p>
          <MiniActivityChart byHour={byHour} />
        </div>
        <div className="snap-start shrink-0 w-full rounded-lg bg-[#1e293b] border border-white/5 p-3">
          <p className="text-xs text-slate-400 mb-2">Distribution by type</p>
          <TypeDistributionChart data={kpis.types} />
        </div>
      </div>
    </div>
  );

  const mobileSavedView = (
    <div className="pb-24 px-3 pt-3 space-y-2">
      {savedAlerts.length === 0 ? (
        <div className="rounded-lg bg-[#1e293b] border border-white/5 p-6 text-center text-sm text-slate-400">No saved alerts yet.</div>
      ) : (
        savedAlerts.map((alert) => (
          <AlertFeedCard
            key={alert.id}
            alert={alert}
            isPinned={pinnedIds.has(alert.id)}
            isBookmarked={bookmarkedIds.has(alert.id)}
            isImportant={importantIds.has(alert.id)}
            onOpen={handleOpenAlert}
            onBookmark={(id) => toggleSetValue(setBookmarkedIds, id)}
            onPin={(id) => toggleSetValue(setPinnedIds, id)}
            onImportant={(id) => toggleSetValue(setImportantIds, id)}
          />
        ))
      )}
    </div>
  );

  const mobileSettingsView = (
    <div className="pb-24 px-3 pt-3 space-y-2">
      <div className="rounded-lg bg-[#1e293b] border border-white/5 p-4">
        <p className="text-sm text-slate-100">Notification preferences</p>
        <p className="text-xs text-slate-400 mt-1">Configure real-time alert behavior and watchlists.</p>
      </div>
    </div>
  );

  const mobileView = (
    <div className="lg:hidden min-h-screen bg-[#0f172a] text-[#e2e8f0]">
      {mobileHeader}
      {mobileTab === 'alerts' && mobileAlertsView}
      {mobileTab === 'sources' && mobileSourcesView}
      {mobileTab === 'analytics' && mobileAnalyticsView}
      {mobileTab === 'saved' && mobileSavedView}
      {mobileTab === 'settings' && mobileSettingsView}
      {mobileTabBar}
    </div>
  );

  return (
    <>
      {desktopView}
      {mobileView}

      {mobileFilterOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileFilterOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="absolute left-0 right-0 bottom-0 rounded-t-2xl bg-[#1e293b] border-t border-white/10 p-4 space-y-4 max-h-[78vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">Filters</h3>
              <button type="button" onClick={() => setMobileFilterOpen(false)} className="h-8 w-8 grid place-items-center rounded-md border border-white/10">
                <X className="w-4 h-4 text-slate-300" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2">Alert type</p>
              <div className="flex gap-2 flex-wrap">
                {ALERT_TYPE_OPTIONS.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, eventType: type }))}
                    className={`h-11 px-3 rounded-md border text-xs ${
                      (filters.eventType || 'all') === type
                        ? 'bg-blue-500/20 border-blue-400/30 text-blue-200'
                        : 'bg-slate-900/30 border-white/10 text-slate-300'
                    }`}
                  >
                    {type === 'all' ? 'All' : type === 'PRICE_ALERT' ? 'Price' : type === 'SENTIMENT' ? 'Sentiment' : 'News'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2">Sources</p>
              <div className="flex gap-2 flex-wrap">
                {sourceOptions.map((source) => {
                  const selected = (filters.sources || []).includes(source);
                  return (
                    <button
                      key={source}
                      type="button"
                      onClick={() => {
                        const current = new Set(filters.sources || []);
                        if (current.has(source)) current.delete(source);
                        else current.add(source);
                        setFilters((prev) => ({ ...prev, sources: Array.from(current) }));
                      }}
                      className={`h-11 px-3 rounded-full border text-xs ${
                        selected
                          ? 'bg-green-500/20 border-green-400/30 text-green-200'
                          : 'bg-slate-900/30 border-white/10 text-slate-300'
                      }`}
                    >
                      {source}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2">Time range</p>
              <div className="flex gap-2">
                {TIME_RANGE_OPTIONS.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, timeRange: range }))}
                    className={`h-11 px-3 rounded-md border text-xs ${
                      (filters.timeRange || '24h') === range
                        ? 'bg-green-500/20 border-green-400/30 text-green-200'
                        : 'bg-slate-900/30 border-white/10 text-slate-300'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilters(DEFAULT_FILTERS);
                  setAppliedFilters(DEFAULT_FILTERS);
                  setMobileFilterOpen(false);
                }}
                className="flex-1 h-11 rounded-md border border-white/10 text-sm text-slate-300"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  setAppliedFilters({ ...filters });
                  setVisibleCount(10);
                  setMobileFilterOpen(false);
                }}
                className="flex-1 h-11 rounded-md bg-blue-500 text-white text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDetailModal
        alert={selectedAlert}
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onMarkAsRead={handleMarkAsRead}
        onDismiss={handleDismiss}
        onApplyPriceFilter={() => applyFilterNow({ eventType: 'PRICE_ALERT' })}
        isPriceRelated={selectedAlert ? inferAlertType(selectedAlert) === 'PRICE_ALERT' : false}
        onFeedback={handleFeedback}
        feedbackState={selectedAlert ? feedbackMap[selectedAlert.id] : null}
      />

      <button
        type="button"
        onClick={handleRefresh}
        className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-20 h-11 px-4 rounded-full bg-[#1e293b] border border-white/10 text-xs text-slate-200 inline-flex items-center gap-2 hover:bg-slate-700/40"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </button>
    </>
  );
};

export default Dashboard;
