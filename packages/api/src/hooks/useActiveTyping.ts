import { useEffect } from 'react';

import { useSelector } from './internal/WebChatReduxContext';
import Typing from '../types/Typing';
import useForceRender from './internal/useForceRender';
import usePonyfill from './usePonyfill';
import useStyleOptions from './useStyleOptions';

function useActiveTyping(expireAfter?: number): [{ [userId: string]: Typing }] {
  const [{ clearTimeout, Date, setTimeout }] = usePonyfill();
  const [{ typingAnimationDuration }] = useStyleOptions();
  const forceRender = useForceRender();
  const typing: { [userId: string]: { at: number; last: number; name: string; role: string } } = useSelector(
    ({ typing }) => typing
  );

  const now = Date.now();

  if (typeof expireAfter !== 'number') {
    expireAfter = typingAnimationDuration;
  }

  const activeTyping: { [userId: string]: Typing } = Object.entries(typing).reduce(
    (activeTyping, [id, { at, last, name, role }]) => {
      const until = last + expireAfter;

      if (until > now) {
        return { ...activeTyping, [id]: { at, expireAt: until, name, role } };
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
