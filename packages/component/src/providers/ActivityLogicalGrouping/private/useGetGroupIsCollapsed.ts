import { useActivityLogicalGroupingContext } from './ActivityLogicalGroupingContext';

/**
 * Returns a getter that reads whether the group is collapsed at call time, without subscribing.
 *
 * Only for keyboard navigation in `TranscriptFocusComposer`, which looks up arbitrary groups while handling a key press.
 * Not exported from the provider: components that render from it must use `useGroupIsCollapsed()`.
 */
export default function useGetGroupIsCollapsed(): (groupKey: string) => boolean | undefined {
  return useActivityLogicalGroupingContext().getGroupIsCollapsed;
}
