import { useEffect } from 'react';

export default function useTimeoutAt(fn, at) {
  useEffect(() => {
    const timer = setTimeout(fn, Math.max(0, at - Date.now()));

    return () => clearTimeout(timer);
  }, [fn, at]);
}
