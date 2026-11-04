import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../api/client';

// Runs `fn` on mount and whenever `deps` change; ignores stale responses.
export default function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: '' }));
    run()
      .then((data) => !cancelled && setState({ data, loading: false, error: '' }))
      .catch(async (err) => {
        const error = await getErrorMessage(err);
        if (!cancelled) setState((s) => ({ ...s, loading: false, error }));
      });
    return () => {
      cancelled = true;
    };
  }, [run, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
