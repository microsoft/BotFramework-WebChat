import { useCallback } from 'react';

import useFocusByActivityKey from '../TranscriptFocus/useFocusByActivityKey';
import useGetGroupDescendantIdByActivityKey from '../TranscriptFocus/useGetGroupDescendantIdByActivityKey';
import { useActivityLogicalGroupingContext } from './private/ActivityLogicalGroupingContext';

export default function useLogicalGroupAwareFocusByActivityKey(): (
  activityKey: boolean | string | undefined,
  withFocus?: boolean
) => void {
  const focusByActivityKey = useFocusByActivityKey();
  const getGroupDescendantIdByActivityKey = useGetGroupDescendantIdByActivityKey();
  const { shouldFocusLogicalGroup, getLogicalGroupKey } = useActivityLogicalGroupingContext();

  return useCallback(
    (activityKey: boolean | string | undefined, withFocus?: boolean) => {
      // If it's a string activity key, check if we should focus the logical group instead
      if (typeof activityKey === 'string' && shouldFocusLogicalGroup(activityKey)) {
        const groupKey = getLogicalGroupKey(activityKey);
        if (groupKey) {
          // Focus on the group header instead of the individual activity
          const groupDescendantId = getGroupDescendantIdByActivityKey(activityKey);
          if (groupDescendantId) {
            // Use the existing focus mechanism but with group awareness
            focusByActivityKey(activityKey, withFocus);
            return;
          }
        }
      }

      // Fallback to normal focus behavior
      focusByActivityKey(activityKey, withFocus);
    },
    [focusByActivityKey, getGroupDescendantIdByActivityKey, shouldFocusLogicalGroup, getLogicalGroupKey]
  );
}
