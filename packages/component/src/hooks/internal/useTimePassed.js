import { useEffect, useState } from 'react';

// Returns true if Date.now() > at, otherwise, false.
// If Date.now() does not meet "at" yet, will trigger a refresh when Date.now() meet "at".
export default function useTimePassed(timeAt) {
  const now = Date.now();
  const [_, setDummy] = useState();
  const passed = now >= timeAt;

  useEffect(() => {
    if (!passed) {
      const timeout = setTimeout(() => setDummy({}), Math.max(0, timeAt - now));

      return () => clearTimeout(timeout);
    }
  }, [now, passed, timeAt]);

  return passed;
}
