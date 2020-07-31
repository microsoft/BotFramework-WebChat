import { useCallback } from 'react';
import { useScrollTo as useScrollToBottomScrollTo } from 'react-scroll-to-bottom';

import useGetTranscriptScrollableElement from './internal/useGetTranscriptScrollableElement';
import useGetTranscriptActivityElementByID from './internal/useGetTranscriptActivityElementByID';

export default function useScrollTo() {
  const getActivityElementByID = useGetTranscriptActivityElementByID();
  const getScrollableElement = useGetTranscriptScrollableElement();
  const scrollTo = useScrollToBottomScrollTo();

  return useCallback(
    (position, { behavior = 'auto' } = {}) => {
      if (!position) {
        throw new Error(
          'botframework-webchat: First argument passed to "useScrollTo" must be a ScrollPosition object.'
        );
      }

      const { activityID, scrollTop } = position;

      if (typeof scrollTop !== 'undefined') {
        scrollTo(scrollTop, { behavior });
      } else if (typeof activityID !== 'undefined') {
        const activityElement = getActivityElementByID(activityID);

        if (activityElement) {
          const scrollableElement = getScrollableElement();
          const [{ height: activityElementHeight, y: activityElementY }] = activityElement.getClientRects();
          const [{ height: scrollableHeight }] = scrollableElement.getClientRects();

          const activityElementOffsetTop = activityElementY + scrollableElement.scrollTop;

          const scrollTop = Math.min(
            activityElementOffsetTop,
            activityElementOffsetTop - scrollableHeight + activityElementHeight
          );

          scrollTo(scrollTop, { behavior });
        }
      }
    },
    [getActivityElementByID, getScrollableElement, scrollTo]
  );
}
