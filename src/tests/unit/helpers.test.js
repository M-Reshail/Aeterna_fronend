import {
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPercentage,
  validateEmail,
  validatePassword,
  validateUrl,
  capitalize,
  truncate,
  slugify,
  highlightText,
  groupBy,
  sortBy,
  filterArray,
  findById,
  uniqueBy,
  pick,
  omit,
  merge,
  isEmpty,
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  debounce,
  throttle,
} from '@utils/helpers';

// ─── formatDate ──────────────────────────────────────────────────────────────
describe('formatDate', () => {
  it('returns empty string for falsy input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('formats a valid ISO date string', () => {
    const result = formatDate('2024-01-15T00:00:00Z');
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2024/);
  });
});

// ─── formatRelativeTime ───────────────────────────────────────────────────────
describe('formatRelativeTime', () => {
  it('returns empty string for falsy input', () => {
    expect(formatRelativeTime(null)).toBe('');
    expect(formatRelativeTime('')).toBe('');
  });

  it('returns "X seconds ago" for a recent timestamp', () => {
    const recent = new Date(Date.now() - 30 * 1000).toISOString();
    expect(formatRelativeTime(recent)).toMatch(/seconds ago/);
  });

  it('returns "X minutes ago" for a timestamp a few minutes back', () => {
    const recent = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(recent)).toMatch(/minutes ago/);
  });

  it('returns "X hours ago" for a timestamp several hours back', () => {
    const past = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(past)).toMatch(/hours ago/);
  });
});

// ─── formatNumber ─────────────────────────────────────────────────────────────
describe('formatNumber', () => {
  it('returns empty string for non-numbers', () => {
    expect(formatNumber('abc')).toBe('');
    expect(formatNumber(null)).toBe('');
  });

  it('formats integer with commas', () => {
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

// ─── formatCurrency ───────────────────────────────────────────────────────────
describe('formatCurrency', () => {
  it('returns empty string for non-numbers', () => {
    expect(formatCurrency('abc')).toBe('');
  });

  it('formats USD correctly', () => {
    expect(formatCurrency(1500)).toMatch(/1,500/);
    expect(formatCurrency(1500)).toMatch(/\$/);
  });
});

// ─── formatPercentage ─────────────────────────────────────────────────────────
describe('formatPercentage', () => {
  it('returns empty string for non-numbers', () => {
    expect(formatPercentage('x')).toBe('');
  });

  it('converts 0.5 to "50.00%"', () => {
    expect(formatPercentage(0.5)).toBe('50.00%');
  });

  it('respects decimal argument', () => {
    expect(formatPercentage(0.333, 1)).toBe('33.3%');
  });
});

// ─── validateEmail ────────────────────────────────────────────────────────────
describe('validateEmail', () => {
  it('accepts valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('user+tag@sub.domain.org')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('@missing.user')).toBe(false);
    expect(validateEmail('missing@')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

// ─── validatePassword ─────────────────────────────────────────────────────────
describe('validatePassword', () => {
  it('accepts a strong password', () => {
    expect(validatePassword('StrongP@ss1')).toBe(true);
  });

  it('rejects password without uppercase', () => {
    expect(validatePassword('weakpass1@')).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    expect(validatePassword('Sh0rt@')).toBe(false);
  });

  it('rejects password without special character', () => {
    expect(validatePassword('NoSpecial1')).toBe(false);
  });
});

// ─── validateUrl ──────────────────────────────────────────────────────────────
describe('validateUrl', () => {
  it('accepts valid URLs', () => {
    expect(validateUrl('https://example.com')).toBe(true);
    expect(validateUrl('http://localhost:3000/path')).toBe(true);
  });

  it('rejects invalid URLs', () => {
    expect(validateUrl('not-a-url')).toBe(false);
    expect(validateUrl('')).toBe(false);
  });
});

// ─── capitalize ───────────────────────────────────────────────────────────────
describe('capitalize', () => {
  it('capitalizes the first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('returns empty string for falsy input', () => {
    expect(capitalize('')).toBe('');
    expect(capitalize(null)).toBe('');
  });

  it('does not lower-case rest of string', () => {
    expect(capitalize('hELLO')).toBe('HELLO');
  });
});

// ─── truncate ─────────────────────────────────────────────────────────────────
describe('truncate', () => {
  it('returns the string unchanged when shorter than limit', () => {
    expect(truncate('short', 50)).toBe('short');
  });

  it('appends ellipsis when string exceeds limit', () => {
    const long = 'a'.repeat(60);
    expect(truncate(long, 50)).toHaveLength(53); // 50 + '...'
    expect(truncate(long, 50)).toMatch(/\.\.\.$/);  // ends with ellipsis
  });

  it('returns empty string for falsy input', () => {
    expect(truncate(null)).toBe('');
  });
});

// ─── slugify ──────────────────────────────────────────────────────────────────
describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('returns empty string for falsy input', () => {
    expect(slugify('')).toBe('');
    expect(slugify(null)).toBe('');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('a  --  b')).toBe('a-b');
  });
});

// ─── formatTime ───────────────────────────────────────────────────────────────
describe('formatTime', () => {
  it('returns empty string for falsy input', () => {
    expect(formatTime(null)).toBe('');
    expect(formatTime('')).toBe('');
  });

  it('returns a valid time string for a date', () => {
    const result = formatTime('2024-01-15T14:30:00Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─── formatDateTime ───────────────────────────────────────────────────────────
describe('formatDateTime', () => {
  it('returns empty string for falsy input', () => {
    expect(formatDateTime(null)).toBe('');
    expect(formatDateTime('')).toBe('');
  });

  it('includes both date and time information', () => {
    const result = formatDateTime('2024-06-15T10:00:00Z');
    expect(result).toMatch(/2024/);
  });
});

// ─── highlightText ────────────────────────────────────────────────────────────
describe('highlightText', () => {
  it('returns text unchanged when query is empty', () => {
    expect(highlightText('Hello world', '')).toBe('Hello world');
  });

  it('returns text unchanged when either arg is falsy', () => {
    expect(highlightText(null, 'query')).toBeNull();
    expect(highlightText('text', null)).toBe('text');
  });

  it('wraps matched text in <mark> tags', () => {
    const result = highlightText('Hello world', 'world');
    expect(result).toContain('<mark>world</mark>');
  });

  it('is case-insensitive', () => {
    const result = highlightText('Hello World', 'hello');
    expect(result).toContain('<mark>');
  });
});

// ─── groupBy ─────────────────────────────────────────────────────────────────
describe('groupBy', () => {
  it('groups array items by a key', () => {
    const arr = [
      { type: 'a', val: 1 },
      { type: 'b', val: 2 },
      { type: 'a', val: 3 },
    ];
    const result = groupBy(arr, 'type');
    expect(result.a).toHaveLength(2);
    expect(result.b).toHaveLength(1);
  });

  it('returns empty object for empty array', () => {
    expect(groupBy([], 'key')).toEqual({});
  });
});

// ─── sortBy ──────────────────────────────────────────────────────────────────
describe('sortBy', () => {
  const items = [{ n: 3 }, { n: 1 }, { n: 2 }];

  it('sorts ascending by default', () => {
    const result = sortBy(items, 'n', 'asc');
    expect(result.map((i) => i.n)).toEqual([1, 2, 3]);
  });

  it('sorts descending when order="desc"', () => {
    const result = sortBy(items, 'n', 'desc');
    expect(result.map((i) => i.n)).toEqual([3, 2, 1]);
  });

  it('does not mutate original array', () => {
    const original = [...items];
    sortBy(items, 'n');
    expect(items).toEqual(original);
  });
});

// ─── filterArray ─────────────────────────────────────────────────────────────
describe('filterArray', () => {
  it('filters items matching predicate', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(filterArray(arr, (n) => n > 3)).toEqual([4, 5]);
  });

  it('returns empty array when nothing matches', () => {
    expect(filterArray([1, 2], (n) => n > 10)).toEqual([]);
  });
});

// ─── findById ────────────────────────────────────────────────────────────────
describe('findById', () => {
  const items = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }];

  it('finds item by id', () => {
    expect(findById(items, 2)).toEqual({ id: 2, name: 'b' });
  });

  it('returns undefined when id not found', () => {
    expect(findById(items, 99)).toBeUndefined();
  });
});

// ─── uniqueBy ────────────────────────────────────────────────────────────────
describe('uniqueBy', () => {
  it('removes duplicates by key', () => {
    const arr = [{ id: 1, v: 'a' }, { id: 1, v: 'b' }, { id: 2, v: 'c' }];
    expect(uniqueBy(arr, 'id')).toHaveLength(2);
  });
});

// ─── pick ────────────────────────────────────────────────────────────────────
describe('pick', () => {
  it('returns only specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
  });

  it('ignores keys not present in object', () => {
    expect(pick({ a: 1 }, ['a', 'b'])).toEqual({ a: 1 });
  });
});

// ─── omit ────────────────────────────────────────────────────────────────────
describe('omit', () => {
  it('returns object without omitted keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
  });

  it('does not mutate original object', () => {
    const obj = { a: 1, b: 2 };
    omit(obj, ['a']);
    expect(obj).toEqual({ a: 1, b: 2 });
  });
});

// ─── merge ───────────────────────────────────────────────────────────────────
describe('merge', () => {
  it('merges two objects', () => {
    expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it('second object overrides first on conflicts', () => {
    expect(merge({ a: 1, b: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });
});

// ─── isEmpty ─────────────────────────────────────────────────────────────────
describe('isEmpty', () => {
  it('returns true for empty object', () => {
    expect(isEmpty({})).toBe(true);
  });

  it('returns false for non-empty object', () => {
    expect(isEmpty({ a: 1 })).toBe(false);
  });
});

// ─── localStorage helpers ─────────────────────────────────────────────────────
describe('setLocalStorage / getLocalStorage / removeLocalStorage', () => {
  beforeEach(() => localStorage.clear());

  it('setLocalStorage stores a value', () => {
    setLocalStorage('testKey', { foo: 'bar' });
    expect(JSON.parse(localStorage.getItem('testKey'))).toEqual({ foo: 'bar' });
  });

  it('getLocalStorage retrieves the stored value', () => {
    setLocalStorage('testKey', 42);
    expect(getLocalStorage('testKey')).toBe(42);
  });

  it('getLocalStorage returns null when key is absent', () => {
    expect(getLocalStorage('missing')).toBeNull();
  });

  it('removeLocalStorage removes the key', () => {
    setLocalStorage('testKey', 'value');
    removeLocalStorage('testKey');
    expect(localStorage.getItem('testKey')).toBeNull();
  });
});

// ─── debounce ────────────────────────────────────────────────────────────────
describe('debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('only calls function once after rapid successive calls', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 200);
    debounced();
    debounced();
    debounced();
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

// ─── throttle ────────────────────────────────────────────────────────────────
describe('throttle', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('calls function immediately on first invocation', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 200);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('ignores calls within throttle window', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 200);
    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('allows another call after throttle window expires', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 200);
    throttled();
    jest.advanceTimersByTime(210);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
