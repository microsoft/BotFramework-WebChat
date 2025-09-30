import { hooks } from 'botframework-webchat-api';
import random from 'math-random';
import { useCallback, useState } from 'react';

import useTimer from './useTimer';

import type { GlobalScopePonyfill } from 'botframework-webchat-core';
import type { Dispatch, SetStateAction } from 'react';

const { usePonyfill } = hooks;

// The `nextTimer` function calculates the next absolute time that the timer should be fired based on the origin (original time received), interval, and current time.
// If the origin is t=260, and we are currently at t=1000, nextTimer must return t=60260.
// If the origin is t=260, and we are currently at t=60260 (exact landing), we must return t=120260, not t=60260.
// This is for fixing bug #2103: https://github.com/microsoft/BotFramework-WebChat/issues/2103.

// False positive: we are using `Date` as a type.
// eslint-disable-next-line no-restricted-globals
function nextTimer(origin: Date, interval: number, { Date }: GlobalScopePonyfill): number {
  const time = origin.getTime();
  const now = Date.now();

  return time > now ? time : now + interval - ((now - time) % interval);
}

export default function useForceRenderAtInterval(
  // False positive: we are using `Date` as a type.
  // eslint-disable-next-line no-restricted-globals
  origin: Date,
  interval: number,
  fn?: (() => void) | undefined
): [number, Dispatch<SetStateAction<number>>] {
  const [ponyfill] = usePonyfill();
  const [timer, setTimer] = useState<number>(nextTimer(origin, interval, ponyfill));
  const handler = useCallback<() => void>(() => {
    fn && fn();

    // Chrome may fire the setTimeout callback 1 ms before its original schedule.
    // Thus, when we calculate the "next" value, it will have the same value as before.
    // Sending the same value to useTimer(), it will not do another schedule because the value did not change.
    // So, we are adding a bit randomness, so useTimer() should pick up the newer scheduled time.

    setTimer(nextTimer(origin, interval, ponyfill) + random());
  }, [fn, origin, interval, ponyfill]);

  useTimer(timer, handler);

  return [timer, setTimer];
}
