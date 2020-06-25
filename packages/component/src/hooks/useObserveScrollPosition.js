import { useCallback } from 'react';

import { useObserveScrollPosition as useScrollToBottomObserveScrollPosition } from 'react-scroll-to-bottom';

export default function useObserveScrollPosition(observer, deps) {
  if (typeof observer !== 'function') {
    observer = undefined;
    console.warn('botframework-webchat: First argument passed to "useObserveScrollPosition" must be a function.');
  } else if (typeof deps !== 'undefined' && !Array.isArray(deps)) {
    console.warn(
      'botframework-webchat: Second argument passed to "useObserveScrollPosition" must be an array if specified.'
    );
  }

  // This hook is very similar to useEffect, which internally use useCallback.
  // The "deps" is treated as the dependencies for the useCallback.
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  const effectCallback = useCallback(({ scrollTop }) => observer && observer({ scrollTop }), deps);

  useScrollToBottomObserveScrollPosition(effectCallback);
}
