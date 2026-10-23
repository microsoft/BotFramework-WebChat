import useKeyedStoreValue from '../../hooks/internal/useKeyedStoreValue';
import { useActivityLogicalGroupingContext } from './private/ActivityLogicalGroupingContext';

/** Returns the key of the logical group of the activity, or `undefined`. Re-renders only when it changes. */
export default function useLogicalGroupKey(activityKey: string): readonly [string | undefined] {
  return useKeyedStoreValue(useActivityLogicalGroupingContext().logicalGroupKeyStore, activityKey);
}
