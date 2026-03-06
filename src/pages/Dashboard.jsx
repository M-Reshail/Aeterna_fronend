import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Tooltip from '@components/common/Tooltip';
import {
  Bell,
  BellRing,
  AlertTriangle,
  Activity,
  RefreshCw,
  Download,
  SlidersHorizontal,
  ChevronDown,
  Inbox,
  Loader2,
  X,
} from 'lucide-react';
import { AlertCard } from '@components/dashboard/AlertCard';
import { AlertDetailModal } from '@components/dashboard/AlertDetailModal';
import { FilterSidebar } from '@components/dashboard/FilterSidebar';
import { useSocket } from '@hooks/useSocket';
import { WS_EVENTS } from '@utils/constants';
import { useAuth } from '@hooks/useAuth';
import { useToast } from '@hooks/useToast';
import feedbackService from '@services/feedbackService';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const generateAlerts = () => {
  const now = Date.now();
  return [
    {
      id: 1, event_type: 'WHALE_ACTIVITY', source: 'Ethereum', title: 'Whale Transfer Detected',
      content: '50,000 ETH moved from unknown wallet 0x4f...a3 to Binance hot wallet. This pattern historically precedes significant sell pressure on major exchanges.',
      priority: 'HIGH', status: 'new', timestamp: new Date(now - 2 * 60000).toISOString(), entity: 'ETH',
    },
    {
      id: 2, event_type: 'PRICE_ALERT', source: 'Binance', title: 'BTC Breaks $65K Support',
      content: 'Bitcoin has broken below the critical $65,000 psychological support level. RSI on the 4H chart indicates oversold conditions. Volume surge of 340% above 30-day average.',
      priority: 'HIGH', status: 'new', timestamp: new Date(now - 5 * 60000).toISOString(), entity: 'BTC',
    },
    {
      id: 3, event_type: 'NEWS', source: 'CoinDesk', title: 'SEC Approves Spot Ethereum ETF',
      content: 'The Securities and Exchange Commission has officially approved spot Ethereum ETF applications from BlackRock, Fidelity, and VanEck. Trading begins next Monday.',
      priority: 'HIGH', status: 'read', timestamp: new Date(now - 15 * 60000).toISOString(), entity: 'ETH',
    },
    {
      id: 4, event_type: 'LIQUIDATION', source: 'Aave', title: 'Large Liquidation Event',
      content: '$12.4M liquidated on Aave protocol across multiple positions. ETH/USDC pool most affected. Triggered by volatile gas fees and sudden price movement.',
      priority: 'HIGH', status: 'new', timestamp: new Date(now - 22 * 60000).toISOString(), entity: 'ETH',
    },
    {
      id: 5, event_type: 'DEFI_ACTIVITY', source: 'Uniswap', title: 'Unusual Pool Activity — SOL/USDC',
      content: 'Liquidity in SOL/USDC pool on Uniswap v3 increased by 240% in the last 30 minutes. Large single LP added $4.2M to the 0.05% fee tier.',
      priority: 'MEDIUM', status: 'new', timestamp: new Date(now - 35 * 60000).toISOString(), entity: 'SOL',
    },
    {
      id: 6, event_type: 'PRICE_ALERT', source: 'Binance', title: 'SOL New All-Time High',
      content: 'Solana (SOL) has reached a new all-time high of $289.34, surpassing the previous ATH of $285 set in November 2021. 24h volume exceeds $8.2B.',
      priority: 'MEDIUM', status: 'read', timestamp: new Date(now - 45 * 60000).toISOString(), entity: 'SOL',
    },
    {
      id: 7, event_type: 'GOVERNANCE', source: 'Ethereum', title: 'Uniswap V4 Governance Vote',
      content: 'A governance proposal to deploy Uniswap V4 on Ethereum mainnet has reached quorum with 89% approval. Deployment estimated within 2 weeks pending final audits.',
      priority: 'MEDIUM', status: 'new', timestamp: new Date(now - 62 * 60000).toISOString(), entity: 'UNI',
    },
    {
      id: 8, event_type: 'NEWS', source: 'Twitter', title: 'Coinbase Lists PEPE Perpetuals',
      content: 'Coinbase International has listed PEPE perpetual futures with up to 10x leverage. Open interest reached $48M within the first hour of trading.',
      priority: 'MEDIUM', status: 'read', timestamp: new Date(now - 90 * 60000).toISOString(), entity: 'PEPE',
    },
    {
      id: 9, event_type: 'DEFI_ACTIVITY', source: 'Aave', title: 'New WBTC Market Live on Aave V3',
      content: 'Aave governance has approved and deployed a new WBTC isolated market on V3 Ethereum. Initial deposit cap set at 1,000 WBTC with 70% LTV.',
      priority: 'LOW', status: 'read', timestamp: new Date(now - 2.5 * 3600000).toISOString(), entity: 'WBTC',
    },
    {
      id: 10, event_type: 'NEWS', source: 'CoinDesk', title: 'Grayscale Files for XRP Spot ETF',
      content: 'Grayscale Investments has officially filed with the SEC for an XRP spot ETF product. The filing follows the recent Ripple partial court victory and growing institutional interest.',
      priority: 'LOW', status: 'read', timestamp: new Date(now - 4 * 3600000).toISOString(), entity: 'XRP',
    },
    {
      id: 11, event_type: 'PRICE_ALERT', source: 'Binance', title: 'MATIC Rebrands to POL',
      content: 'Polygon has initiated the transition from MATIC to POL token as part of its 2.0 upgrade. Token swap ratio is 1:1. Migration portal now open.',
      priority: 'LOW', status: 'read', timestamp: new Date(now - 6 * 3600000).toISOString(), entity: 'POL',
    },
    {
      id: 12, event_type: 'LARGE_TRANSFER', source: 'Solana', title: 'Large SOL Movement Detected',
      content: '2.8M SOL tokens transferred from Kraken cold storage to an unknown wallet. On-chain analysis suggests possible OTC deal or protocol treasury movement.',
      priority: 'MEDIUM', status: 'new', timestamp: new Date(now - 8 * 3600000).toISOString(), entity: 'SOL',
    },
  ];
};

const DEFAULT_FILTERS = {
  priority: ['HIGH', 'MEDIUM', 'LOW'],
  entity: '',
  dateFrom: '',
  dateTo: '',
  sources: [],
};

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Newest First' },
  { value: 'oldest',   label: 'Oldest First' },
  { value: 'priority', label: 'Priority (High → Low)' },
  { value: 'unread',   label: 'Unread First' },
];

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
const ACCENT_COLORS = {
  emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', val: 'text-emerald-400' },
  red:     { icon: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     val: 'text-red-400'     },
  amber:   { icon: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   val: 'text-amber-400'   },
  blue:    { icon: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    val: 'text-blue-400'    },
};

const StatCard = ({ icon: Icon, label, value, subValue, accentColor = 'emerald' }) => {
  const c = ACCENT_COLORS[accentColor] || ACCENT_COLORS.emerald;
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#080808] border border-[#1A1A1A] hover:border-[#252525] transition-all duration-300">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg} border ${c.border}`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${c.val}`}>{value}</span>
          {subValue && <span className="text-xs text-slate-500">{subValue}</span>}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────
const EmptyState = ({ hasFilters, onClear }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center px-8">
    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
      <Inbox className="w-8 h-8 text-slate-500" />
    </div>
    <h3 className="text-base font-bold text-white mb-2">No alerts found</h3>
    <p className="text-sm text-slate-500 max-w-xs mb-6">
      {hasFilters
        ? 'No alerts match your current filters. Try adjusting or clearing them.'
        : 'Your alert feed is clear. New alerts will appear here in real-time.'}
    </p>
    {hasFilters && (
      <button
        onClick={onClear}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all duration-200"
      >
        Clear Filters
      </button>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SKELETON
// ─────────────────────────────────────────────────────────────────────────────
const AlertSkeleton = () => (
  <div className="flex gap-4 p-4 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F] animate-pulse">
    <div className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0" />
    <div className="flex-1 space-y-2.5">
      <div className="flex gap-2">
        <div className="h-4 w-14 rounded-md bg-white/5" />
        <div className="h-4 w-20 rounded-md bg-white/5" />
        <div className="ml-auto h-4 w-20 rounded-md bg-white/5" />
      </div>
      <div className="h-4 w-3/4 rounded-md bg-white/5" />
      <div className="h-3 w-full rounded-md bg-white/5" />
      <div className="h-3 w-2/3 rounded-md bg-white/5" />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export const Dashboard = () => {
  const queryClient = useQueryClient();
  const { on } = useSocket({ autoConnect: true });
  const { user } = useAuth();
  const toast = useToast();
  const [allAlerts, setAllAlerts]         = useState([]);
  const [filters, setFilters]             = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy]               = useState('newest');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isLoading, setIsLoading]         = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount]   = useState(8);
  const [filterOpen, setFilterOpen]       = useState(false);
  const [isRefreshing, setIsRefreshing]   = useState(false);
  const [showSortMenu, setShowSortMenu]   = useState(false);
  const [recentAlertIds, setRecentAlertIds] = useState(new Set());
  const [feedbackMap, setFeedbackMap] = useState({});
  const sortMenuRef = useRef(null);
  const feedRef     = useRef(null);

  // Initial load simulation
  useEffect(() => {
    const t = setTimeout(() => {
      setAllAlerts(generateAlerts());
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const unsubscribe = on(WS_EVENTS.NEW_ALERT, (incoming) => {
      if (!incoming?.id) return;

      const normalized = {
        status: 'new',
        timestamp: new Date().toISOString(),
        ...incoming,
      };

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

      if (normalized.priority === 'HIGH' && 'Notification' in window) {
        const permission = Notification.permission;
        if (permission === 'granted') {
          new Notification(normalized.title || 'New high priority alert', {
            body: normalized.content || normalized.source || 'Tap to view details',
          });
        } else if (permission === 'default' && !localStorage.getItem('alerts_notification_prompted')) {
          localStorage.setItem('alerts_notification_prompted', '1');
          Notification.requestPermission();
        }
      }

      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [on, queryClient]);

  // Close sort menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Apply filters + sort (memo)
  const filtered = useMemo(() => {
    let result = allAlerts;

    if (appliedFilters.priority.length < 3) {
      result = result.filter((a) => appliedFilters.priority.includes(a.priority));
    }
    if (appliedFilters.entity) {
      const term = appliedFilters.entity.toLowerCase();
      result = result.filter(
        (a) =>
          a.entity?.toLowerCase().includes(term) ||
          a.title?.toLowerCase().includes(term) ||
          a.source?.toLowerCase().includes(term)
      );
    }
    if (appliedFilters.dateFrom) {
      const from = new Date(appliedFilters.dateFrom);
      result = result.filter((a) => new Date(a.timestamp) >= from);
    }
    if (appliedFilters.dateTo) {
      const to = new Date(appliedFilters.dateTo + 'T23:59:59');
      result = result.filter((a) => new Date(a.timestamp) <= to);
    }
    if (appliedFilters.sources?.length > 0) {
      result = result.filter((a) => appliedFilters.sources.includes(a.source));
    }

    const sorted = [...result];
    if (sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else if (sortBy === 'priority') {
      sorted.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3));
    } else if (sortBy === 'unread') {
      sorted.sort((a, b) => {
        if (a.status === 'new' && b.status !== 'new') return -1;
        if (a.status !== 'new' && b.status === 'new') return 1;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
    } else {
      sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    return sorted;
  }, [allAlerts, appliedFilters, sortBy]);

  // Infinite scroll
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120 && !isLoadingMore) {
        if (visibleCount < filtered.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 4, filtered.length));
            setIsLoadingMore(false);
          }, 600);
        }
      }
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [filtered.length, isLoadingMore, visibleCount]);

  const visibleAlerts = filtered.slice(0, visibleCount);
  const unreadCount = allAlerts.filter((a) => a.status === 'new').length;
  const highPriorityCount = allAlerts.filter((a) => a.priority === 'HIGH').length;
  const highUnread = allAlerts.filter((a) => a.priority === 'HIGH' && a.status === 'new').length;

  const handleMarkAsRead = useCallback((id) => {
    setAllAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'read' } : a)));
    setSelectedAlert((prev) => (prev?.id === id ? { ...prev, status: 'read' } : prev));
  }, []);

  const handleOpenAlert = useCallback((alert) => {
    // Auto-mark as read on open (Gmail-style)
    const readAlert = { ...alert, status: 'read' };
    setSelectedAlert(readAlert);
    setAllAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, status: 'read' } : a)));
  }, []);

  const handleDismiss = useCallback((id) => {
    setAllAlerts((prev) => prev.filter((a) => a.id !== id));
    setSelectedAlert(null);
  }, []);

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

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setVisibleCount(8);
    setFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setVisibleCount(8);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsLoading(true);
    setTimeout(() => {
      setAllAlerts(generateAlerts());
      setIsLoading(false);
      setIsRefreshing(false);
    }, 700);
  };

  const hasActiveFilters =
    appliedFilters.priority.length < 3 ||
    !!appliedFilters.entity ||
    !!appliedFilters.dateFrom ||
    !!appliedFilters.dateTo ||
    (appliedFilters.sources?.length ?? 0) > 0;

  const currentSortLabel = SORT_OPTIONS.find((s) => s.value === sortBy)?.label || 'Newest First';

  return (
    <div className="min-h-screen w-full pt-28 pb-12 px-4 lg:px-6" style={{ position: 'relative', zIndex: 1 }}>
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* PAGE HEADER */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Alert Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time market signals aggregated from 50+ sources
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Tooltip content="Reload latest alerts" placement="bottom">
              <button
                onClick={handleRefresh}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#0D0D0D] border border-[#1F1F1F] text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400 transition-all duration-200 ${isRefreshing ? 'text-emerald-400 border-emerald-500/40' : ''}`}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </Tooltip>
            <Tooltip content="Export visible alerts to CSV" placement="bottom">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#0D0D0D] border border-[#1F1F1F] text-slate-400 hover:border-white/20 hover:text-white transition-all duration-200">
                <Download className="w-4 h-4" />
                Export
              </button>
            </Tooltip>
            {/* Mobile filter toggle */}
            <Tooltip content="Filter alerts by priority, source, and date" placement="bottom">
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${filterOpen ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#0D0D0D] border-[#1F1F1F] text-slate-400'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center">!</span>
                )}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Bell}          label="Total Alerts"    value={isLoading ? '…' : allAlerts.length}    subValue="all time"           accentColor="blue"    />
          <StatCard icon={BellRing}      label="Unread"          value={isLoading ? '…' : unreadCount}         subValue="requires action"    accentColor="amber"   />
          <StatCard icon={AlertTriangle} label="High Priority"   value={isLoading ? '…' : highPriorityCount}   subValue={`${highUnread} unread`}  accentColor="red"   />
          <StatCard icon={Activity}      label="Sources Active"  value="50+"                                    subValue="live feeds"          accentColor="emerald" />
        </div>

        {/* MAIN CONTENT: SIDEBAR + FEED */}
        <div className="flex gap-4 items-start">

          {/* FILTER SIDEBAR — Desktop */}
          <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0 sticky top-28">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              totalCount={allAlerts.length}
              filteredCount={filtered.length}
            />
          </div>

          {/* FILTER SIDEBAR — Mobile overlay */}
          {filterOpen && (
            <div className="lg:hidden fixed inset-0 z-40" onClick={() => setFilterOpen(false)}>
              <div className="absolute inset-0 bg-black/70" />
              <div className="absolute bottom-0 left-0 right-0 max-h-[82vh] overflow-y-auto rounded-t-2xl" onClick={(e) => e.stopPropagation()}>
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={setFilters}
                  onApply={handleApplyFilters}
                  onClear={handleClearFilters}
                  totalCount={allAlerts.length}
                  filteredCount={filtered.length}
                />
              </div>
            </div>
          )}

          {/* ALERT FEED */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">

            {/* Feed toolbar */}
            <div className="flex items-center justify-between gap-3 flex-wrap px-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {isLoading ? '…' : filtered.length} alerts
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Clear filters
                  </button>
                )}
              </div>

              {/* Sort dropdown */}
              <div ref={sortMenuRef} className="relative">
                <button
                  onClick={() => setShowSortMenu((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#0D0D0D] border border-[#1F1F1F] text-slate-400 hover:border-white/20 hover:text-white transition-all duration-200"
                >
                  {currentSortLabel}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showSortMenu && (
                  <div className="absolute right-0 top-full mt-2 z-30 w-48 rounded-xl overflow-hidden bg-[#0D0D0D] border border-[#1F1F1F] shadow-2xl">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${sortBy === opt.value ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 px-1">
                {appliedFilters.priority.length < 3 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Priority: {appliedFilters.priority.join(', ')}
                    <button onClick={() => {
                      const nf = { ...appliedFilters, priority: ['HIGH', 'MEDIUM', 'LOW'] };
                      setAppliedFilters(nf); setFilters(nf);
                    }}><X className="w-3 h-3" /></button>
                  </div>
                )}
                {appliedFilters.entity && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Token: {appliedFilters.entity}
                    <button onClick={() => {
                      const nf = { ...appliedFilters, entity: '' };
                      setAppliedFilters(nf); setFilters(nf);
                    }}><X className="w-3 h-3" /></button>
                  </div>
                )}
                {(appliedFilters.dateFrom || appliedFilters.dateTo) && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Date range active
                    <button onClick={() => {
                      const nf = { ...appliedFilters, dateFrom: '', dateTo: '' };
                      setAppliedFilters(nf); setFilters(nf);
                    }}><X className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
            )}

            {/* Feed list */}
            <div
              ref={feedRef}
              className="space-y-2 overflow-y-auto pr-1"
              style={{ maxHeight: 'calc(100vh - 300px)', minHeight: '400px' }}
            >
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <AlertSkeleton key={i} />)
              ) : visibleAlerts.length === 0 ? (
                <EmptyState hasFilters={hasActiveFilters} onClear={handleClearFilters} />
              ) : (
                <>
                  {visibleAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`transition-all duration-500 ${recentAlertIds.has(alert.id) ? 'opacity-100 scale-[1.01]' : 'opacity-100 scale-100'}`}
                    >
                      <AlertCard
                        alert={alert}
                        onViewDetails={handleOpenAlert}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    </div>
                  ))}

                  {isLoadingMore && (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                      <span className="ml-2 text-sm text-slate-500">Loading more alerts…</span>
                    </div>
                  )}

                  {!isLoadingMore && visibleCount >= filtered.length && filtered.length > 0 && (
                    <div className="text-center py-8">
                      <p className="text-xs text-slate-600">All {filtered.length} alerts loaded</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ALERT DETAIL MODAL */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onMarkAsRead={handleMarkAsRead}
        onDismiss={handleDismiss}
        onFeedback={handleFeedback}
        feedbackState={selectedAlert ? feedbackMap[selectedAlert.id] : null}
      />
    </div>
  );
};

export default Dashboard;
