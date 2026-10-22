import { useScrollTo as useReactScrollToBottomScrollTo } from 'react-scroll-to-bottom';

import { type ScrollToOptions } from './types.js';

/** Scrolls the transcript to the given offset from the top. */
export default function useScrollTo(): (scrollTop: number, init?: ScrollToOptions | undefined) => void {
  return useReactScrollToBottomScrollTo();
}
