import useKeyedSubscriptionValue from '../../hooks/internal/keyedSubscription/useKeyedSubscriptionValue';
import { useActivityLogicalGroupingContext, type GroupState } from './private/ActivityLogicalGroupingContext';

/**
 * Returns the state of the logical group, such as whether it is collapsed, or `undefined` if the group does not exist or has no state.
 *
 * The component re-renders only when the state of this group changes.
 */
export default function useGroupState(groupKey: string): readonly [GroupState | undefined] {
  const { getGroupState, subscribeGroupState } = useActivityLogicalGroupingContext();

  return useKeyedSubscriptionValue(subscribeGroupState, groupKey, getGroupState);
}
