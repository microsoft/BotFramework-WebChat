import { useCallback } from 'react';
import { useObserveScrollPosition as useScrollToBottomObserveScrollPosition } from 'react-scroll-to-bottom';

import useGetTranscriptScrollableElement from './internal/useGetTranscriptScrollableElement';
import useTranscriptActivityElementsRef from './internal/useTranscriptActivityElementsRef';

export default function useObserveScrollPosition(observer, deps) {
  const getTranscriptScrollableElement = useGetTranscriptScrollableElement();
  const [activityElementsRef] = useTranscriptActivityElementsRef();

  if (typeof observer !== 'function') {
    observer = undefined;
    console.warn('botframework-webchat: First argument passed to "useObserveScrollPosition" must be a function.');
  } else if (typeof deps !== 'undefined' && !Array.isArray(deps)) {
    console.warn(
      'botframework-webchat: Second argument passed to "useObserveScrollPosition" must be an array if specified.'
    );
  }

  const effectCallback = useCallback(
    ({ scrollTop }) => {
      const scrollable = getTranscriptScrollableElement();
      const [{ height: offsetHeight } = {}] = scrollable.getClientRects();

      // Find the activity just above scroll view bottom.
      // If the scroll view is already on top, get the first activity.
      const entry = scrollable.scrollTop
        ? [...activityElementsRef.current].reverse().find(({ element }) => {
            if (!element) {
              return false;
            }

            const [{ y } = {}] = element.getClientRects();

            return y < offsetHeight;
          })
        : activityElementsRef.current[0];

      const { activityID } = entry || {};

      observer && observer({ ...(activityID ? { activityID } : {}), scrollTop });
    },
    // This hook is very similar to useEffect, which internally use useCallback.
    // The "deps" is treated as the dependencies for the useCallback.
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [activityElementsRef, getTranscriptScrollableElement, ...(deps || [])]
  );

  useScrollToBottomObserveScrollPosition(effectCallback);
}
