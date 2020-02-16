import { useEffect } from 'react';

import { useSelector } from '../WebChatReduxContext';
import useForceRender from './internal/useForceRender';
import useStyleOptions from './useStyleOptions';

function useActiveTyping(typingAnimationDuration) {
  const now = Date.now();

  const [{ typingAnimationDuration: typingAnimationDurationFromStyleOptions }] = useStyleOptions();
  const forceRender = useForceRender();
  const typing = useSelector(({ typing }) => typing);

  if (typeof typingAnimationDuration !== 'number') {
    typingAnimationDuration = typingAnimationDurationFromStyleOptions;
  }

  const activeTyping = Object.entries(typing).reduce((activeTyping, [id, { at, name, role }]) => {
    const until = at + typingAnimationDuration;

    if (until > now) {
      return { ...activeTyping, [id]: { end: until, name, role, start: at } };
    }

    return activeTyping;
  }, {});

  const earliestEnd = Math.min(...Object.values(activeTyping).map(({ end }) => end)) || 0;
  const timeToRender = earliestEnd && earliestEnd - now;

  useEffect(() => {
    if (timeToRender && isFinite(timeToRender)) {
      const timeout = setTimeout(forceRender, Math.max(0, timeToRender));

      return () => clearTimeout(timeout);
    }
  }, [forceRender, timeToRender]);

  return [activeTyping];
}

export default useActiveTyping;
