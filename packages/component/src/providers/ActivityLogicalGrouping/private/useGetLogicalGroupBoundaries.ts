import { useActivityLogicalGroupingContext } from './ActivityLogicalGroupingContext';

/**
 * Returns a getter that reads the latest first and last activity keys of a group at call time, without subscribing.
 *
 * Only for keyboard navigation in `TranscriptFocusComposer`, which looks up arbitrary groups while handling a key press.
 */
export default function useGetLogicalGroupBoundaries(): (groupKey: string) => [string | undefined, string | undefined] {
  return useActivityLogicalGroupingContext().getGroupBoundaries;
}
