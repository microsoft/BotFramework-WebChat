import { useActivityLogicalGroupingContext, type GroupState } from './ActivityLogicalGroupingContext';

/**
 * Returns a getter that reads the latest group state at call time, without subscribing.
 *
 * Only for keyboard navigation in `TranscriptFocusComposer`, which looks up arbitrary groups while handling a key press.
 * Not exported from the provider: components that render from the group state must use `useGroupState()`.
 */
export default function useGetGroupState(): (groupKey: string) => GroupState | undefined {
  return useActivityLogicalGroupingContext().getGroupState;
}
