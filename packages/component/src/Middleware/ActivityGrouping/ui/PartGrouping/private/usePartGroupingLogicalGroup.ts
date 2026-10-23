import random from 'math-random';
import { useLayoutEffect, useMemo } from 'react';

import { useRemoveLogicalGrouping, useSetLogicalGrouping } from '../../../../../providers/ActivityLogicalGrouping';

type UsePartGroupingLogicalGroupOptions = {
  activityKeys: readonly string[];
  isCollapsed: boolean;
};

function usePartGroupingLogicalGroup({ activityKeys, isCollapsed }: UsePartGroupingLogicalGroupOptions): string {
  // eslint-disable-next-line no-magic-numbers
  const partGroupKey = useMemo(() => `part-${random().toString(36).slice(2, 11)}`, []);
  const removeLogicalGrouping = useRemoveLogicalGrouping();
  const setLogicalGrouping = useSetLogicalGrouping();

  // Sets the group in an effect, not while rendering: Strict Mode runs the cleanup below, then runs this effect again.
  // A layout effect, so activities using `useLogicalGroupKey()` or `useGroupIsCollapsed()` re-render before the browser paints.
  // Collapsing or expanding the group updates it here, which notifies `useGroupIsCollapsed()`.
  useLayoutEffect(() => {
    setLogicalGrouping(partGroupKey, { activityKeys: Object.freeze(Array.from(activityKeys)), isCollapsed });
  }, [activityKeys, isCollapsed, partGroupKey, setLogicalGrouping]);

  useLayoutEffect(() => () => removeLogicalGrouping(partGroupKey), [partGroupKey, removeLogicalGrouping]);

  return partGroupKey;
}

export default usePartGroupingLogicalGroup;
export { type UsePartGroupingLogicalGroupOptions };
