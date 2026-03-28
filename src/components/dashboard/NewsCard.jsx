import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, Clock, ExternalLink, Eye, Newspaper, User } from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '@utils/helpers';

const safeToString = (value, fallback = '') => {
  if (typeof value === 'string') return value.trim() || fallback;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value && typeof value === 'object') {
    return (value.summary || value.title || value.description || '').toString().trim() || fallback;
  }
  return fallback;
};

const asArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

const resolvePublishedDate = (alert) =>
  alert.published_date ||
  alert?.rawContent?.published_date ||
  alert?.rawContent?.published_at ||
  alert?.rawContent?.publication_date ||
  alert?.rawContent?.date_published;

const priorityStyles = {
  HIGH: 'border-red-500/40 bg-red-500/10 text-red-300',
  MEDIUM: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  LOW: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
};

export const NewsCard = ({ alert, onViewDetails, onMarkAsRead }) => {
  const categories = asArray(alert.categories || alert?.rawContent?.categories);
  const hashtags = asArray(alert.hashtags || alert?.rawContent?.hashtags);
  const mentions = asArray(alert.mentions || alert?.rawContent?.mentions);
  const author = safeToString(alert.author || alert?.rawContent?.author, 'Unknown');
  const summary = safeToString(alert.summary || alert.content, '');
  const qualityScore = alert?.metrics?.quality_score ?? alert?.rawContent?.quality_score;
  const publishedDate = resolvePublishedDate(alert);
  const source = safeToString(alert.source, 'unknown');
  const isUnread = alert.status === 'new';

  return (
    <article
      className="rounded-2xl border border-blue-500/25 bg-gradient-to-br from-slate-950 to-blue-950/25 p-4 sm:p-5 cursor-pointer hover:border-blue-400/40 transition-all duration-200"
      onClick={() => onViewDetails && onViewDetails(alert)}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${priorityStyles[alert.priority] || priorityStyles.LOW}`}>
            {alert.priority || 'LOW'}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] text-blue-200 border border-blue-500/30 bg-blue-500/10">
            NEWS
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] text-slate-300 border border-slate-600 bg-slate-800/60">
            {source}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="w-3 h-3" />
          {publishedDate ? formatRelativeTime(publishedDate) : formatRelativeTime(alert.timestamp)}
        </span>
      </div>

      <div className="flex items-start gap-2">
        <Newspaper className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
        <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">{safeToString(alert.title, 'Untitled')}</h3>
      </div>

      {summary && <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{summary}</p>}

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-lg border border-slate-700/70 bg-slate-900/70 p-2">
          <div className="text-slate-500">Author</div>
          <div className="text-slate-200 font-medium inline-flex items-center gap-1"><User className="w-3 h-3" />{author}</div>
        </div>
        <div className="rounded-lg border border-slate-700/70 bg-slate-900/70 p-2">
          <div className="text-slate-500">Quality Score</div>
          <div className="text-slate-200 font-medium">{qualityScore ?? 'Not provided'}</div>
        </div>
        <div className="rounded-lg border border-slate-700/70 bg-slate-900/70 p-2">
          <div className="text-slate-500">Published</div>
          <div className="text-slate-200 font-medium">{publishedDate ? formatDateTime(publishedDate) : 'Not provided'}</div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div>
          <div className="text-[10px] text-slate-500 mb-1">Categories</div>
          <div className="flex flex-wrap gap-1">
            {categories.length > 0 ? categories.map((value) => (
              <span key={`${alert.id}-category-${value}`} className="px-1.5 py-0.5 rounded-md text-[10px] border border-indigo-500/30 bg-indigo-500/10 text-indigo-200">{value}</span>
            )) : <span className="text-[10px] text-slate-500">None</span>}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 mb-1">Hashtags</div>
          <div className="flex flex-wrap gap-1">
            {hashtags.length > 0 ? hashtags.map((value) => (
              <span key={`${alert.id}-hashtag-${value}`} className="px-1.5 py-0.5 rounded-md text-[10px] border border-blue-500/30 bg-blue-500/10 text-blue-200">{String(value).startsWith('#') ? value : `#${value}`}</span>
            )) : <span className="text-[10px] text-slate-500">None</span>}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500 mb-1">Mentions</div>
          <div className="flex flex-wrap gap-1">
            {mentions.length > 0 ? mentions.map((value) => (
              <span key={`${alert.id}-mention-${value}`} className="px-1.5 py-0.5 rounded-md text-[10px] border border-slate-600 bg-slate-800 text-slate-200">{value}</span>
            )) : <span className="text-[10px] text-slate-500">None</span>}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onViewDetails && onViewDetails(alert)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-200 text-xs font-medium hover:bg-blue-500/20"
        >
          <Eye className="w-3 h-3" /> Details
        </button>
        {isUnread && (
          <button
            onClick={() => onMarkAsRead && onMarkAsRead(alert.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700"
          >
            <CheckCircle className="w-3 h-3" /> Mark Read
          </button>
        )}
        {safeToString(alert.link || alert?.rawContent?.link, '') && (
          <a
            href={safeToString(alert.link || alert?.rawContent?.link, '')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 text-xs font-medium hover:bg-cyan-500/20"
          >
            <ExternalLink className="w-3 h-3" /> Source
          </a>
        )}
      </div>
    </article>
  );
};

NewsCard.propTypes = {
  alert: PropTypes.object.isRequired,
  onViewDetails: PropTypes.func,
  onMarkAsRead: PropTypes.func,
};

export default NewsCard;
