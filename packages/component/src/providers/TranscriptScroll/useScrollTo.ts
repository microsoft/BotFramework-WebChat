import { useScrollTo as useReactScrollToBottomScrollTo } from 'react-scroll-to-bottom';

import { type ScrollToOptions } from './types';

export default function useScrollTo(): (scrollTop: number, init?: ScrollToOptions | undefined) => void {
  return useReactScrollToBottomScrollTo();
}
