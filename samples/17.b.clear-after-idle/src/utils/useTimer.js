import { useEffect } from "react";

export default function useTimer(
  timeRemaining,
  fn,
  setTimeRemaining,
  step = 1000
) {
  useEffect(() => {
    let timeout;
    if (timeRemaining > 0) {
      timeout = setTimeout(
        () => setTimeRemaining(ms => (ms > step ? ms - step : 0)),
        step
      );
    } else if (timeRemaining === 0) {
      fn();
      setTimeRemaining();
    }

    return () => clearTimeout(timeout);
  }, [fn, timeRemaining, setTimeRemaining, step]);
}
