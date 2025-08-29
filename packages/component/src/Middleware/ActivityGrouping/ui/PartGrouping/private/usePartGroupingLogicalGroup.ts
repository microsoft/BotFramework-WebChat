import { useEffect, useMemo, useRef } from 'react';
import { useRefFrom } from 'use-ref-from';

import { useAddLogicalGrouping } from '../../../../../providers/ActivityLogicalGrouping';

const getPartGropKey = (key: string) => `part-grouping-${key}`;

type UsePartGroupingLogicalGroupOptions = {
  activityKeys: readonly string[];
  isCollapsed: boolean;
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
  isCollapsed
}: UsePartGroupingLogicalGroupOptions): UsePartGroupingLogicalGroupReturn {
  const addLogicalGrouping = useAddLogicalGrouping();

  useMemo(
    () =>
      addLogicalGrouping({
        // use activity key for group identifier as there should be only one logical group per activity
        id: getPartGropKey(activityKeys.at(0)),
        name: 'part',
        activityKeys: [...activityKeys],
        getGroupState: () => ({
          isCollapsed
        })
      }),
    [activityKeys, addLogicalGrouping, isCollapsed]
  );

  const addLogicalGroupingRef = useRef(addLogicalGrouping);
  const activityKeysRef = useRefFrom(activityKeys);

  useEffect(
    () => () =>
      addLogicalGroupingRef.current({
        id: getPartGropKey(activityKeysRef.current.at(0)),
        name: 'part(removed)',
        activityKeys: [],
        getGroupState: () => ({ isCollapsed: false })
      }),
    [activityKeysRef, addLogicalGroupingRef]
  );
}

export default usePartGroupingLogicalGroup;
export { type UsePartGroupingLogicalGroupOptions, type UsePartGroupingLogicalGroupReturn, getPartGropKey };
