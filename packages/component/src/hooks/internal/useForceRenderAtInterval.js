import { useCallback, useState } from 'react';
import random from 'math-random';

import useTimer from './useTimer';

// The `nextTimer` function calculates the next absolute time that the timer should be fired based on the origin (original time received), interval, and current time.
// If the origin is t=260, and we are currently at t=1000, nextTimer must return t=60260.
// If the origin is t=260, and we are currently at t=60260 (exact landing), we must return t=120260, not t=60260.
// This is for fixing bug #2103: https://github.com/microsoft/BotFramework-WebChat/issues/2103.

function nextTimer(origin, interval) {
  const time = new Date(origin).getTime();
  const now = Date.now();

  return time > now ? time : now + interval - ((now - time) % interval);
}

export default function useForceRenderAtInterval(origin, interval, fn) {
  const [timer, setTimer] = useState(nextTimer(origin, interval));
  const handler = useCallback(() => {
    fn && fn();

    // Chrome may fire the setTimeout callback 1 ms before its original schedule.
    // Thus, when we calculate the "next" value, it will have the same value as before.
    // Sending the same value to useTimer(), it will not do another schedule because the value did not change.
    // So, we are adding a bit randomness, so useTimer() should pick up the newer scheduled time.

    setTimer(nextTimer(origin, interval) + random());
  }, [fn, origin, interval]);

  useTimer(timer, handler);

  return [timer, setTimer];
}
