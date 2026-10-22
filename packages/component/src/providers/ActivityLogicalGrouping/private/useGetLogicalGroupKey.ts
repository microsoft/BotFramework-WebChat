import { useActivityLogicalGroupingContext } from './ActivityLogicalGroupingContext';

/**
 * Returns a getter that reads the latest group key at call time, without subscribing.
 *
 * Only for keyboard navigation in `TranscriptFocusComposer`, which looks up arbitrary activities while handling a key press.
 * Not exported from the provider: components that render from the group key must use `useLogicalGroupKey()`.
 */
export default function useGetLogicalGroupKey(): (activityKey: string) => string | undefined {
  return useActivityLogicalGroupingContext().getLogicalGroupKey;
}
