import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Search,
  Filter as FilterIcon,
  Loader2,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  Calendar,
  Globe,
} from 'lucide-react';
import { AlertCard } from '@components/dashboard/AlertCard';
import eventsService from '@services/eventsService';
import { useToast } from '@hooks/useToast';

const News = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allNews, setAllNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [sourceOptions, setSourceOptions] = useState([]);
  const feedRef = useRef(null);

  // Normalize news event
  const normalizeNewsEvent = (event) => {
    const content = event?.content || {};
    const title = content.title || content.name || `News from ${event?.source || 'source'}`;
    const body = content.summary || content.alert_reasons || content.link || 'No details provided';

    return {
      id: `event-${event?.id}`,
      event_id: event?.id,
      event_type: 'NEWS',
      source: event?.source || 'unknown',
      title,
      content: body,
      priority: content.quality_score >= 70 ? 'HIGH' : content.quality_score >= 50 ? 'MEDIUM' : 'LOW',
      status: 'new',
      timestamp: event?.timestamp || new Date().toISOString(),
      entity: content.id || content.symbol || content.name || '',
      rawContent: {
        ...content,
        type: event?.type,
      },
    };
  };

  // Load news from API
  useEffect(() => {
    const loadNews = async () => {
      try {
        setIsLoading(true);
        const news = await eventsService.getEventsByType('news', { skip: 0, limit: 200 });
        
        if (Array.isArray(news)) {
          const normalized = news.map(normalizeNewsEvent);
          setAllNews(normalized);
          
          // Extract unique sources
          const sources = Array.from(
            new Set(normalized.map(n => n.source).filter(Boolean))
          ).sort();
          setSourceOptions(sources);
        }
      } catch (error) {
        toast.error('Failed to load news');
        console.error('Error loading news:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
  }, [toast]);

  // Filter and sort news
  const filtered = allNews.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.entity.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    const matchesSource = sourceFilter === 'all' || item.source === sourceFilter;
    
    return matchesSearch && matchesPriority && matchesSource;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch(sortBy) {
      case 'oldest':
        return new Date(a.timestamp) - new Date(b.timestamp);
      case 'priority':
        const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'newest':
      default:
        return new Date(b.timestamp) - new Date(a.timestamp);
    }
  });

  const getPriorityStats = () => {
    return {
      high: allNews.filter(n => n.priority === 'HIGH').length,
      medium: allNews.filter(n => n.priority === 'MEDIUM').length,
      low: allNews.filter(n => n.priority === 'LOW').length,
    };
  };

  const stats = getPriorityStats();

  return (
    <div className="min-h-screen w-full pt-24 sm:pt-28 pb-12 px-3 sm:px-4 lg:px-6 bg-gradient-to-b from-slate-900 via-[#0f172a] to-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Globe className="w-8 h-8 text-emerald-400" />
              All News
            </h1>
            <p className="text-sm text-slate-400 mt-1">High-impact market news & updates</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-lg p-4">
            <p className="text-xs text-red-400 font-medium mb-1">High Impact</p>
            <p className="text-2xl font-bold text-red-300">{stats.high}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg p-4">
            <p className="text-xs text-amber-400 font-medium mb-1">Medium Impact</p>
            <p className="text-2xl font-bold text-amber-300">{stats.medium}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20 rounded-lg p-4">
            <p className="text-xs text-slate-400 font-medium mb-1">Low Impact</p>
            <p className="text-2xl font-bold text-slate-300">{stats.low}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search news by title, content, or token..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Priority Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              >
                <option value="all">All Priorities</option>
                <option value="HIGH">High Impact Only</option>
                <option value="MEDIUM">Medium Impact</option>
                <option value="LOW">Low Impact</option>
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Source</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              >
                <option value="all">All Sources</option>
                {sourceOptions.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority (High → Low)</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-xs text-slate-500">
            Found <span className="text-emerald-400 font-semibold">{sorted.length}</span> news articles
            {(searchTerm || priorityFilter !== 'all' || sourceFilter !== 'all') && ' (filtered)'}
          </div>
        </div>

        {/* News List */}
        <div ref={feedRef} className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mr-2" />
              <span className="text-slate-400">Loading news...</span>
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
              <FilterIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">No news found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            sorted.map(news => (
              <div key={news.id} className="transform transition-all hover:scale-[1.01]">
                <AlertCard
                  alert={news}
                  onViewDetails={() => {}}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default News;
