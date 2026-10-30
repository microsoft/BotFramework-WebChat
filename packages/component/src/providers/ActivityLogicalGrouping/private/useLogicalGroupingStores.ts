import { useMemo } from 'react';

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
  const { logicalGroupKeyStore, logicalGroupingStore } = useActivityLogicalGroupingContext();

  // The composer creates both stores once, so this object never changes.
  return useMemo(
    () => Object.freeze({ logicalGroupKeyStore, logicalGroupingStore }),
    [logicalGroupKeyStore, logicalGroupingStore]
  );
}
