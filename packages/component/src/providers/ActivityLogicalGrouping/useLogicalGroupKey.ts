import useKeyedSubscriptionValue from '../../hooks/internal/keyedSubscription/useKeyedSubscriptionValue';
import { useActivityLogicalGroupingContext } from './private/ActivityLogicalGroupingContext';

/**
 * Returns the key of the logical group the activity belongs to, or `undefined` if it is not part of any group.
 *
 * The component re-renders only when the group key of this activity changes.
 */
export default function useLogicalGroupKey(activityKey: string): readonly [string | undefined] {
  const { getLogicalGroupKey, subscribeLogicalGroupKey } = useActivityLogicalGroupingContext();

  return useKeyedSubscriptionValue(subscribeLogicalGroupKey, activityKey, getLogicalGroupKey);
}
