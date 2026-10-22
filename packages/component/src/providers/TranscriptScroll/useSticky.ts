import { useMemo } from 'react';
import { useSticky as useReactScrollToBottomSticky } from 'react-scroll-to-bottom';

/** Returns `true` when the transcript follows new content (scrolls to the end as content grows). */
export default function useSticky(): readonly [boolean] {
  const [sticky] = useReactScrollToBottomSticky();

  return useMemo(() => Object.freeze([sticky] as const), [sticky]);
}
