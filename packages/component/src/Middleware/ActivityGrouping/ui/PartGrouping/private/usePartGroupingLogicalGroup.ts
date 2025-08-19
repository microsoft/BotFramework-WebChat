import { useMemo, useRef } from 'react';

import { useAddLogicalGrouping } from '../../../../../providers/ActivityLogicalGrouping';

const getPartGropKey = (key: string) => `part-grouping-${key}`;

type UsePartGroupingLogicalGroupOptions = {
  activityKeys: readonly string[];
  isGroupOpen: boolean;
};

type UsePartGroupingLogicalGroupReturn = {
  shouldSkipRender: boolean;
};

/**
 * Custom hook for managing part grouping logical groups.
 *
 * @param options - Configuration options for the grouping
 * @returns Object containing shouldSkipRender flag
 */
function usePartGroupingLogicalGroup({
  activityKeys,
  isGroupOpen
}: UsePartGroupingLogicalGroupOptions): UsePartGroupingLogicalGroupReturn {
  const addLogicalGrouping = useAddLogicalGrouping();
  const isInitialGroupingRef = useRef(true);

  const shouldSkipRender = useMemo(() => {
    const isInitialGrouping = isInitialGroupingRef.current;

    addLogicalGrouping({
      // use activity key for group identifier as there should be only one logical group per activity
      id: getPartGropKey(activityKeys.at(0)),
      name: 'part',
      activityKeys: [...activityKeys],
      getGroupState: () => ({
        isCollapsed: !isGroupOpen
      })
    });

    // If this is the initial grouping, mark it and skip render
    if (isInitialGrouping) {
      isInitialGroupingRef.current = false;
      return true;
    }

    return false;
  }, [activityKeys, addLogicalGrouping, isGroupOpen]);

  return { shouldSkipRender };
}

export default usePartGroupingLogicalGroup;
export { type UsePartGroupingLogicalGroupOptions, type UsePartGroupingLogicalGroupReturn, getPartGropKey };
