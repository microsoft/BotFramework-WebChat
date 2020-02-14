import { useEffect } from 'react';

export default function useTimer(at, fn) {
  useEffect(() => {
    if (typeof at === 'number') {
      const timeout = setTimeout(fn, Math.max(0, at - Date.now()));

      return () => clearTimeout(timeout);
    }
  }, [at, fn]);
}
