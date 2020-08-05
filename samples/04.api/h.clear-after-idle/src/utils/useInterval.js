import { useEffect } from 'react';

export default function useInterval(fn, intervalMS) {
  useEffect(() => {
    if (!fn || intervalMS === 0 || typeof intervalMS !== 'number') {
      return;
    }

    const interval = setInterval(fn, intervalMS);

    return () => clearInterval(interval);
  }, [fn, intervalMS]);

  return false;
}
