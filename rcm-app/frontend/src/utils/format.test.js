import { describe, expect, it } from 'vitest';
import { cleanParams, formatCurrency, formatDate, getPageList } from './format';

describe('format utils', () => {
  it('formats currency', () => expect(formatCurrency(2347890)).toBe('$2,347,890.00'));
  it('formats date-only strings without timezone shifts', () => expect(formatDate('2026-08-24')).toBe('08/24/2026'));
  it('drops empty params', () => expect(cleanParams({ a: '', b: 'x', c: null, d: 0 })).toEqual({ b: 'x', d: 0 }));
  it('builds a pagination window', () => {
    expect(getPageList(1, 126)).toEqual([1, 2, 3, 4, 5, '…', 126]);
    expect(getPageList(60, 126)).toEqual([1, '…', 59, 60, 61, '…', 126]);
    expect(getPageList(2, 3)).toEqual([1, 2, 3]);
  });
});
