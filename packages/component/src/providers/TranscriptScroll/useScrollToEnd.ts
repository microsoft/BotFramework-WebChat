import { useScrollToEnd as useReactScrollToBottomScrollToEnd } from 'react-scroll-to-bottom';

import { type ScrollToOptions } from './types';

/** Scrolls to the end and follows new content again. */
export default function useScrollToEnd(): (init?: ScrollToOptions | undefined) => void {
  return useReactScrollToBottomScrollToEnd();
}
