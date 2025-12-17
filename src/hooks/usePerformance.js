// src/hooks/usePerformance.js
import { useEffect, useState } from 'react';

import useLiveAnalytics from '@/hooks/useLiveAnalytics'; // existing hook
import { getPerformance } from '@/api/apis';

export default function usePerformance(range = '7d') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // subscribe to socket performance events (if server emits them)
  const { live } = useLiveAnalytics({ initialFetch: () => getPerformance(range) });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        // initial REST fetch (fast)
        const res = await getPerformance(range);
        if (!mounted) return;
        if (res && res.data) setData(res.data);
      } catch (err) {
        console.warn('getPerformance failed:', err);
        setError(err?.message || 'Failed to fetch performance');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [range]);

  // listen for socket performance update events (structure: map of ranges)
  useEffect(() => {
    if (!live) return;
    // if `live` contains a performance map (poller emits analytics:performance)
    if (live.rows == null && live.metrics == null && live['24h']) {
      // full performance map
      if (live[range]) setData(live[range]);
    } else if (live && live.metrics) {
      // single-range response (if server emits only one)
      if (live && live.metrics) setData(live);
    }
  }, [live, range]);

  return { data, loading, error };
}
