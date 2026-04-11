const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const toText = (value, fallback = '') => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return fallback;
};

const toStringArray = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => toText(item, '').trim())
    .filter(Boolean);
};

export const normalizeEvent = (rawEvent = {}, alert = null) => {
  const content = isObject(rawEvent?.content) ? rawEvent.content : {};
  const details = isObject(content?.details) ? content.details : {};
  const safeAlert = isObject(alert) ? alert : {};

  const priorityCandidate = toText(
    safeAlert?.priority,
    toText(content?.priority_marker, 'LOW')
  ).toUpperCase();

  const imageUrl = toText(content?.image_url, '') || null;
  const summaryText = toText(
    content?.summary,
    toText(
      content?.full_summary,
      toText(
        content?.description,
        toText(
          details?.summary,
          toText(details?.full_summary, toText(details?.description, ''))
        )
      )
    )
  ) || null;

  if (content?.has_image === true && !imageUrl) {
    console.log('[normalizeEvent] has_image=true but image_url is missing', {
      id: rawEvent?.id ?? rawEvent?.alert_id ?? null,
      source: rawEvent?.source ?? null,
      title: toText(content?.title, toText(safeAlert?.title, 'Untitled')),
    });
  }

  return {
    title: toText(content?.title, toText(safeAlert?.title, 'Untitled')),
    summary: summaryText,
    source: toText(rawEvent?.source, '') || null,
    type: toText(rawEvent?.type, '') || null,
    event_hash: toText(content?.event_hash, toText(rawEvent?.event_hash, '')) || null,
    priority: ['HIGH', 'MEDIUM', 'LOW'].includes(priorityCandidate) ? priorityCandidate : 'LOW',
    author: content?.has_author ? toText(content?.author, '') || null : null,
    image_url: imageUrl,
    has_image: content?.has_image === true,
    has_author: content?.has_author === true,
    word_count: Number.isFinite(Number(content?.word_count)) ? Number(content.word_count) : null,
    read_time_minutes: Number.isFinite(Number(content?.read_time_minutes)) ? Number(content.read_time_minutes) : null,
    quality_score: Number.isFinite(Number(content?.quality_score)) ? Number(content.quality_score) : null,
    urls: Array.isArray(content?.urls) ? content.urls : [],
    timestamp: toText(rawEvent?.timestamp, '') || null,
    detailTimestamp: toText(content?.published, '') || null,
    hashtags: toStringArray(content?.hashtags),
    mentions: toStringArray(content?.mentions),
    categories: toStringArray(content?.categories),
  };
};
