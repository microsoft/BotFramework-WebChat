import { useEffect } from 'react';

import useAllTyping from '../providers/ActivityTyping/useAllTyping';
import { type Typing } from '../types/Typing';
import useForceRender from './internal/useForceRender';
import usePonyfill from './usePonyfill';
import useStyleOptions from './useStyleOptions';

function useActiveTyping(expireAfter?: number): [{ [userId: string]: Typing }] {
  const [{ clearTimeout, Date, setTimeout }] = usePonyfill();
  const [{ typingAnimationDuration }] = useStyleOptions();
  const [typing] = useAllTyping();
  const forceRender = useForceRender();

  const now = Date.now();

  if (typeof expireAfter !== 'number') {
    expireAfter = typingAnimationDuration;
  }

  const activeTyping: { [userId: string]: Typing } = [...typing.entries()].reduce(
    (
      activeTyping,
      [id, { firstTypingActivity, firstAppearAt, lastTypingActivity, lastAppearAt, name, role }]
    ): Record<string, Typing> => {
      const until = lastAppearAt + expireAfter;

      if (until > now) {
        return {
          ...activeTyping,
          [id]: {
            at: firstAppearAt,
            firstTypingActivity,
            expireAt: until,
            lastTypingActivity,
            name,
            role
          }
        };
      }

      return activeTyping;
    },
    {}
  );

  const earliestExpireAt = Math.min(...Object.values(activeTyping).map(({ expireAt }) => expireAt));
  const timeToRender = earliestExpireAt && earliestExpireAt - now;

  useEffect(() => {
    if (timeToRender && isFinite(timeToRender)) {
      const timeout = setTimeout(forceRender, Math.max(0, timeToRender));

      return () => clearTimeout(timeout);
    }
  }, [clearTimeout, forceRender, setTimeout, timeToRender]);

  return [activeTyping];
}

export default useActiveTyping;
