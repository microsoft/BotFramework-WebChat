import { useEffect, useState } from 'react';

// Returns true if Date.now() > at, otherwise, false.
// If Date.now() does not meet "at" yet, will trigger a refresh when Date.now() meet "at".
export default function useTimePassed(timeAt) {
  const [_, setDummy] = useState();

  // Callback passed to useEffect() could be fired a moment later.
  // Thus, we should calculate when to force-render inside the callback, not outside.
  useEffect(() => {
    const now = Date.now();

    if (now < timeAt) {
      const timeout = setTimeout(() => setDummy({}), Math.max(0, timeAt - now));

      return () => clearTimeout(timeout);
    }
  }, [timeAt]);

  return Date.now() >= timeAt;
}
