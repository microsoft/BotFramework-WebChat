import useKeyedSubscriptionValue from '../../hooks/internal/keyedSubscription/useKeyedSubscriptionValue';
import { useActivityLogicalGroupingContext } from './private/ActivityLogicalGroupingContext';

/**
 * Returns whether the logical group is collapsed, or `undefined` if the group does not exist.
 *
 * The component re-renders only when this group collapses, expands, or is removed.
 */
export default function useGroupIsCollapsed(groupKey: string): readonly [boolean | undefined] {
  const { getGroupIsCollapsed, subscribeGroupIsCollapsed } = useActivityLogicalGroupingContext();

  return useKeyedSubscriptionValue(subscribeGroupIsCollapsed, groupKey, getGroupIsCollapsed);
}
