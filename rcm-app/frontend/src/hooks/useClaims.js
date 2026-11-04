import { useCallback, useMemo, useState } from 'react';
import { claimsApi } from '../api/services';
import { cleanParams } from '../utils/format';
import useAsync from './useAsync';

export const EMPTY_FILTERS = {
  patientName: '', claimNumber: '', dosFrom: '', dosTo: '', payerId: '',
  status: '', actionCode: '', statusCode: '', providerNpi: '',
};

export default function useClaims(presetStatus = '') {
  const initial = { ...EMPTY_FILTERS, status: presetStatus };
  const [draft, setDraft] = useState(initial);
  const [applied, setApplied] = useState(initial);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState({ sortBy: 'dos', sortDir: 'desc' });
  const [selected, setSelected] = useState(() => new Set());

  const params = useMemo(
    () => cleanParams({ ...applied, page, pageSize, ...sort }),
    [applied, page, pageSize, sort],
  );
  const { data, loading, error, reload } = useAsync(() => claimsApi.list(params), [params]);

  const updateDraft = useCallback((field, value) => setDraft((d) => ({ ...d, [field]: value })), []);

  const applyFilters = useCallback(() => {
    setApplied(draft);
    setPage(1);
    setSelected(new Set());
  }, [draft]);

  const clearFilters = useCallback(() => {
    setDraft(initial);
    setApplied(initial);
    setPage(1);
    setSelected(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetStatus]);

  const filterByStatus = useCallback((status) => {
    const next = (s) => ({ ...s, status: s.status === status ? '' : status });
    setDraft(next);
    setApplied(next);
    setPage(1);
    setSelected(new Set());
  }, []);

  const toggleSort = useCallback((sortBy) => {
    setSort((s) => ({ sortBy, sortDir: s.sortBy === sortBy && s.sortDir === 'asc' ? 'desc' : 'asc' }));
    setPage(1);
  }, []);

  const changePageSize = useCallback((size) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const toggleRow = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const rows = data?.data;
  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const ids = (rows || []).map((r) => r.id);
      return ids.length && ids.every((id) => prev.has(id)) ? new Set() : new Set(ids);
    });
  }, [rows]);

  return {
    draft, applied, updateDraft, applyFilters, clearFilters, filterByStatus,
    page, setPage, pageSize, changePageSize, sort, toggleSort,
    selected, toggleRow, toggleAll,
    rows: rows || [], meta: data?.meta, statusCounts: data?.statusCounts,
    loading, error, reload, params,
  };
}
