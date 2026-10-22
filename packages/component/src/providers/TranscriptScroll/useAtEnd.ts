import { useMemo } from 'react';
import { useAtEnd as useReactScrollToBottomAtEnd } from 'react-scroll-to-bottom';

/** Returns `true` when the transcript is scrolled to its end. */
export default function useAtEnd(): readonly [boolean] {
  const [atEnd] = useReactScrollToBottomAtEnd();

  return useMemo(() => Object.freeze([atEnd] as const), [atEnd]);
}
