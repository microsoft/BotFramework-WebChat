import { useCallback } from 'react';
import { useScrollTo as useScrollToBottomScrollTo } from 'react-scroll-to-bottom';

export default function useScrollTo() {
  const scrollTo = useScrollToBottomScrollTo();

  return useCallback(
    (position, { behavior = 'auto' } = {}) => {
      if (!position) {
        throw new Error(
          'botframework-webchat: First argument passed to "useScrollTo" must be a ScrollPosition object.'
        );
      }

      const { scrollTop } = position;

      typeof scrollTop !== 'undefined' && scrollTo(scrollTop, { behavior });
    },
    [scrollTo]
  );
}
