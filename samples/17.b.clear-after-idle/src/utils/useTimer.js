import { useEffect, useState } from 'react';

export default function useTimer(fn, step = 1000) {
  const [timeRemaining, setTimeRemaining] = useState();

  useEffect(() => {
    let timeout;
    if (timeRemaining > 0) {
      timeout = setTimeout(() => setTimeRemaining(ms => (ms > step ? ms - step : 0)), step);
    } else if (timeRemaining === 0) {
      setTimeRemaining();
      fn();
    }

    return () => clearTimeout(timeout);
  }, [fn, timeRemaining, setTimeRemaining, step]);

  return [timeRemaining, setTimeRemaining];
}
