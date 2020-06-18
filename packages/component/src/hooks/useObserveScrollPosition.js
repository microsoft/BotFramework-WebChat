import { useCallback } from 'react';

import { useObserveScrollTop } from 'react-scroll-to-bottom';

export default function useObserveScrollPosition(observer, deps) {
  if (typeof observer !== 'function') {
    observer = undefined;
    console.warn('botframework-webchat: First argument passed to "useObserveScrollPosition" must be a function.');
  } else if (typeof deps !== 'undefined' && !Array.isArray(deps)) {
    console.warn(
      'botframework-webchat: Second argument passed to "useObserveScrollPosition" must be an array if specified.'
    );
  }

  const effectCallback = useCallback(({ scrollTop }) => observer && observer({ scrollTop }), deps);

  useObserveScrollTop(effectCallback);
}
