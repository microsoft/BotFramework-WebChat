import { useEffect, useState } from 'react';

// Returns true if Date.now() > at, otherwise, false.
// If Date.now() does not meet "at" yet, will trigger a refresh when Date.now() meet "at".
export default function useTimePast(at) {
  const now = Date.now();
  const [_, setDummy] = useState();
  const past = now >= at;

  useEffect(() => {
    if (!past) {
      const timeout = setTimeout(() => setDummy({}), Math.max(0, at - now));

      return () => clearTimeout(timeout);
    }
  }, [at, now, past]);

  return past;
}
