import { useCallback } from 'react';

import { useScrollToEnd as useScrollToBottomScrollToEnd } from 'react-scroll-to-bottom';

export default function useScrollToEnd() {
  const scrollToEnd = useScrollToBottomScrollToEnd();

  return useCallback(() => scrollToEnd({ behavior: 'smooth' }), [scrollToEnd]);
}
