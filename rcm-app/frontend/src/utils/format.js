const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const formatCurrency = (n) => usd.format(Number(n) || 0);
export const formatCurrencyCompact = (n) => `$${Math.round(n / 1000)}K`;
export const formatNumber = (n) => new Intl.NumberFormat('en-US').format(Number(n) || 0);

// Accepts 'YYYY-MM-DD' or an ISO timestamp and returns MM/DD/YYYY.
export const formatDate = (value) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value.slice(5, 7)}/${value.slice(8, 10)}/${value.slice(0, 4)}`;
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ''
    : `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
};

export const cleanParams = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v != null));

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');

export const getPageList = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
};
