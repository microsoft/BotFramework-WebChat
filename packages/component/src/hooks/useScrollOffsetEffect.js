import { useCallback } from 'react';

import { useScrollTopEffect } from 'react-scroll-to-bottom';

export default function useScrollOffsetEffect(fn, deps) {
  if (typeof fn !== 'function') {
    fn = undefined;
    console.warn('botframework-webchat: First argument passed to useScrollOffsetEffect must be a function.');
  } else if (typeof deps !== 'undefined' && !Array.isArray(deps)) {
    console.warn(
      'botframework-webchat: Second argument passed to useScrollOffsetEffect must be an array if specified.'
    );
  }

  const effectCallback = useCallback(scrollTop => fn && fn({ scrollTop }), deps);

  useScrollTopEffect(effectCallback);
}
