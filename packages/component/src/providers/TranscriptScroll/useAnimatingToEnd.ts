import { useMemo } from 'react';
import { useAnimatingToEnd as useReactScrollToBottomAnimatingToEnd } from 'react-scroll-to-bottom';

/** Returns `true` while the transcript is animating towards its end. */
export default function useAnimatingToEnd(): readonly [boolean] {
  const [animatingToEnd] = useReactScrollToBottomAnimatingToEnd();

  return useMemo(() => Object.freeze([animatingToEnd] as const), [animatingToEnd]);
}
