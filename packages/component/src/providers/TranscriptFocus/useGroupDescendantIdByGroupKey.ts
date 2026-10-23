import useKeyedSubscriptionValue from '../../hooks/internal/keyedSubscription/useKeyedSubscriptionValue';
import useTranscriptFocusContext from './private/useContext';

/**
 * Returns the ID of the group's active descendant element, for `aria-activedescendant`, or `undefined` without a group key.
 *
 * Re-renders when `<TranscriptFocusComposer>` notifies that the ID of this group changed.
 */
export default function useGroupDescendantIdByGroupKey(groupKey?: string | undefined): readonly [string | undefined] {
  const { getGroupDescendantIdByGroupKey, subscribeGroupDescendantId } = useTranscriptFocusContext();

  return useKeyedSubscriptionValue(subscribeGroupDescendantId, groupKey, getGroupDescendantIdByGroupKey);
}
