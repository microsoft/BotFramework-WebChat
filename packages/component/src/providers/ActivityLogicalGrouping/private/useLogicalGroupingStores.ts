import {
  useActivityLogicalGroupingContext,
  type ActivityLogicalGroupingContextType
} from './ActivityLogicalGroupingContext';

/**
 * For keyboard navigation, which reads the groups of other activities at event time.
 * To render from a group key, use `useLogicalGroupKey()`, which subscribes.
 */
export default function useLogicalGroupingStores(): Pick<
  ActivityLogicalGroupingContextType,
  'logicalGroupKeyStore' | 'logicalGroupingStore'
> {
  return useActivityLogicalGroupingContext();
}
