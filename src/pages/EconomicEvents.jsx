import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Search,
  Filter as FilterIcon,
  Loader2,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useToast } from '@hooks/useToast';

const EconomicEvents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [impactFilter, setImpactFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [countryOptions, setCountryOptions] = useState([]);

  // Mock economic events data - in production, this would come from an API
  const mockEconomicEvents = [
    {
      id: 'event-1',
      title: 'US Federal Funds Rate Decision',
      country: 'USA',
      impact: 'HIGH',
      date: new Date().toISOString(),
      time: '18:00',
      forecast: '5.25%-5.50%',
      previous: '5.25%-5.50%',
      actual: null,
      description: 'The Federal Reserve\'s decision on interest rates. This is one of the most important economic announcements affecting global markets, particularly the USD and equity markets.',
      category: 'Rates Decision',
    },
    {
      id: 'event-2',
      title: 'Eurozone Inflation Rate (YoY)',
      country: 'Eurozone',
      impact: 'HIGH',
      date: new Date().toISOString(),
      time: '10:00',
      forecast: '3.1%',
      previous: '3.0%',
      actual: null,
      description: 'Eurozone inflation on a yearly basis. A key indicator for ECB policy decisions and EUR movements.',
      category: 'Inflation',
    },
    {
      id: 'event-3',
      title: 'UK Unemployment Rate',
      country: 'United Kingdom',
      impact: 'MEDIUM',
      date: new Date().toISOString(),
      time: '09:30',
      forecast: '4.0%',
      previous: '4.0%',
      actual: null,
      description: 'The British unemployment rate. Important for Bank of England policy and GBP movements.',
      category: 'Employment',
    },
    {
      id: 'event-4',
      title: 'Japan Industrial Production',
      country: 'Japan',
      impact: 'MEDIUM',
      date: new Date().toISOString(),
      time: '08:30',
      forecast: '2.3%',
      previous: '1.5%',
      actual: null,
      description: 'Industrial production data for Japan, indicating economic activity and manufacturing strength.',
      category: 'Production',
    },
    {
      id: 'event-5',
      title: 'China GDP (YoY)',
      country: 'China',
      impact: 'HIGH',
      date: new Date(Date.now() + 86400000).toISOString(),
      time: '09:00',
      forecast: '5.2%',
      previous: '4.9%',
      actual: null,
      description: 'China\'s quarterly GDP growth rate. Highly significant for global markets and cryptocurrency sentiment.',
      category: 'GDP',
    },
    {
      id: 'event-6',
      title: 'US Non-Farm Payrolls',
      country: 'USA',
      impact: 'HIGH',
      date: new Date(Date.now() + 172800000).toISOString(),
      time: '13:30',
      forecast: '200K',
      previous: '275K',
      actual: null,
      description: 'Number of jobs added in the US non-farm sector. One of the most important indicators for USD and equity markets.',
      category: 'Employment',
    },
    {
      id: 'event-7',
      title: 'Australia Employment Change',
      country: 'Australia',
      impact: 'MEDIUM',
      date: new Date().toISOString(),
      time: '01:30',
      forecast: '25K',
      previous: '15.4K',
      actual: null,
      description: 'Monthly employment change in Australia. Important for ASX and AUD movements.',
      category: 'Employment',
    },
    {
      id: 'event-8',
      title: 'Canada Retail Sales',
      country: 'Canada',
      impact: 'MEDIUM',
      date: new Date().toISOString(),
      time: '13:30',
      forecast: '-0.3%',
      previous: '0.1%',
      actual: null,
      description: 'Retail sales data for Canada, indicating consumer spending and economic health.',
      category: 'Retail',
    },
  ];

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setEvents(mockEconomicEvents);
        
        // Extract unique countries
        const countries = Array.from(
          new Set(mockEconomicEvents.map(e => e.country))
        ).sort();
        setCountryOptions(countries);
      } catch (error) {
        toast.error('Failed to load economic events');
        console.error('Error loading events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [toast]);

  // Filter events
  const filtered = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesImpact = impactFilter === 'all' || event.impact === impactFilter;
    const matchesCountry = countryFilter === 'all' || event.country === countryFilter;
    
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      eventDate.setHours(0, 0, 0, 0);
      matchesDate = eventDate.getTime() === today.getTime();
    } else if (dateFilter === 'upcoming') {
      matchesDate = new Date(event.date) >= today;
    }
    
    return matchesSearch && matchesImpact && matchesCountry && matchesDate;
  });

  const getImpactColor = (impact) => {
    switch(impact) {
      case 'HIGH': return 'from-red-500/10 to-red-600/5 border-red-500/20 text-red-400';
      case 'MEDIUM': return 'from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-400';
      case 'LOW': return 'from-slate-500/10 to-slate-600/5 border-slate-500/20 text-slate-400';
      default: return 'from-slate-500/10 to-slate-600/5 border-slate-500/20 text-slate-400';
    }
  };

  const formatTime = (timeStr) => {
    try {
      return new Date(`2024-01-01 ${timeStr}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeStr;
    }
  };

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
              <Calendar className="w-8 h-8 text-amber-400" />
              Economic Calendar
            </h1>
            <p className="text-sm text-slate-400 mt-1">Today's market-moving events</p>
          </div>
        </div>

        {/* Impact Legend */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-lg p-4">
            <p className="text-xs text-red-400 font-medium mb-1">High Impact</p>
            <p className="text-2xl font-bold text-red-300">{events.filter(e => e.impact === 'HIGH').length}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg p-4">
            <p className="text-xs text-amber-400 font-medium mb-1">Medium Impact</p>
            <p className="text-2xl font-bold text-amber-300">{events.filter(e => e.impact === 'MEDIUM').length}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/5 border border-slate-500/20 rounded-lg p-4">
            <p className="text-xs text-slate-400 font-medium mb-1">Low Impact</p>
            <p className="text-2xl font-bold text-slate-300">{events.filter(e => e.impact === 'LOW').length}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Date Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Date</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              >
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>

            {/* Impact Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Impact</label>
              <select
                value={impactFilter}
                onChange={(e) => setImpactFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              >
                <option value="all">All Impact Levels</option>
                <option value="HIGH">High Impact Only</option>
                <option value="MEDIUM">Medium Impact</option>
                <option value="LOW">Low Impact</option>
              </select>
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Country</label>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              >
                <option value="all">All Countries</option>
                {countryOptions.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-xs text-slate-500">
            Found <span className="text-emerald-400 font-semibold">{filtered.length}</span> events
            {(searchTerm || impactFilter !== 'all' || countryFilter !== 'all') && ' (filtered)'}
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mr-2" />
              <span className="text-slate-400">Loading events...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
              <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">No events found</p>
              <p className="text-xs text-slate-500">Try adjusting your filters</p>
            </div>
          ) : (
            filtered.map(event => (
              <div
                key={event.id}
                className={`bg-gradient-to-br ${getImpactColor(event.impact)} border rounded-xl p-4 hover:border-neutral-400/50 transition-all cursor-pointer hover:shadow-lg`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title and Impact */}
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-sm leading-tight pr-2">
                          {event.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {event.country} • {event.category}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                        event.impact === 'HIGH' ? 'bg-red-500/20 text-red-300' :
                        event.impact === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-slate-500/20 text-slate-300'
                      }`}>
                        {event.impact}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 mb-3 line-clamp-2">{event.description}</p>

                    {/* Time and Forecast */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-slate-500 text-[10px] uppercase tracking-wide">Time</p>
                        <p className="text-white font-semibold mt-1">{formatTime(event.time)}</p>
                      </div>
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-slate-500 text-[10px] uppercase tracking-wide">Forecast</p>
                        <p className="text-emerald-400 font-semibold mt-1">{event.forecast}</p>
                      </div>
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-slate-500 text-[10px] uppercase tracking-wide">Previous</p>
                        <p className="text-slate-300 font-semibold mt-1">{event.previous}</p>
                      </div>
                      <div className="bg-white/5 rounded p-2">
                        <p className="text-slate-500 text-[10px] uppercase tracking-wide">Actual</p>
                        <p className="text-slate-400 font-semibold mt-1">{event.actual || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EconomicEvents;
