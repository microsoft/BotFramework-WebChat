import random from 'math-random';
import { useLayoutEffect, useMemo } from 'react';

import { useAddLogicalGrouping, useRemoveLogicalGrouping } from '../../../../../providers/ActivityLogicalGrouping';

type UsePartGroupingLogicalGroupOptions = {
  activityKeys: readonly string[];
  isCollapsed: boolean;
};

function usePartGroupingLogicalGroup({ activityKeys, isCollapsed }: UsePartGroupingLogicalGroupOptions): string {
  // eslint-disable-next-line no-magic-numbers
  const partGroupKey = useMemo(() => `part-${random().toString(36).slice(2, 11)}`, []);
  const addLogicalGrouping = useAddLogicalGrouping();
  const removeLogicalGrouping = useRemoveLogicalGrouping();

  // Same object until collapsed or expanded, so `useGroupState()` re-renders only then.
  const groupState = useMemo(() => Object.freeze({ isCollapsed }), [isCollapsed]);

  // Adds the group in an effect, not while rendering: Strict Mode runs the cleanup below, then runs this effect again.
  // A layout effect, so activities using `useLogicalGroupKey()` or `useGroupState()` re-render before the browser paints.
  // Collapsing or expanding the group updates it here, which notifies `useGroupState()`.
  useLayoutEffect(() => {
    addLogicalGrouping({
      activityKeys: Object.freeze(Array.from(activityKeys)),
      groupState,
      key: partGroupKey
    });
  }, [activityKeys, addLogicalGrouping, groupState, partGroupKey]);

  useLayoutEffect(() => () => removeLogicalGrouping(partGroupKey), [partGroupKey, removeLogicalGrouping]);

  return partGroupKey;
}

export default usePartGroupingLogicalGroup;
export { type UsePartGroupingLogicalGroupOptions };
