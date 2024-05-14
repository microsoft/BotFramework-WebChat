import { useEffect } from 'react';

import useAllTyping from '../providers/ActivityTyping/useAllTyping';
import { type Typing } from '../types/Typing';
import useForceRender from './internal/useForceRender';
import reduceIterable from './private/reduceIterable';
import usePonyfill from './usePonyfill';
import useStyleOptions from './useStyleOptions';

function useActiveTyping(expireAfter?: number): readonly [Readonly<Record<string, Typing>>] {
  const [{ clearTimeout, Date, setTimeout }] = usePonyfill();
  const [{ typingAnimationDuration }] = useStyleOptions();
  const [typing] = useAllTyping();
  const forceRender = useForceRender();
  const now = Date.now();

  // TODO: We should use useState to simplify the force render part.
  const activeTypingState: readonly [Readonly<Record<string, Typing>>] = Object.freeze([
    Object.freeze(
      Object.fromEntries(
        reduceIterable(
          typing.entries(),
          (activeTypingMap, [id, { firstAppearAt, lastActivityDuration, lastAppearAt, name, role, type }]) => {
            const expireAt = lastAppearAt + (expireAfter ?? lastActivityDuration ?? typingAnimationDuration);

            if (expireAt > now) {
              activeTypingMap.set(id, { at: firstAppearAt, expireAt, name, role, type });
            }

            return activeTypingMap;
          },
          new Map<string, Typing>()
        ).entries()
      )
    )
  ]);

  const earliestExpireAt = Math.min(...Object.values(activeTypingState[0]).map(({ expireAt }) => expireAt));
  const timeToRender = earliestExpireAt && earliestExpireAt - now;

  useEffect(() => {
    if (timeToRender && isFinite(timeToRender)) {
      const timeout = setTimeout(forceRender, Math.max(0, timeToRender));

      return () => clearTimeout(timeout);
    }
  }, [clearTimeout, forceRender, setTimeout, timeToRender]);

  return activeTypingState;
}

export default useActiveTyping;
