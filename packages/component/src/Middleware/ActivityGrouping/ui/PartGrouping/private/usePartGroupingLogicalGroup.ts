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

  // In layout effects, not while rendering: setting re-renders the activities before paint.
  // Strict Mode runs the cleanup below, then this effect again.
  // Removed in its own effect, so a change of `activityKeys` updates the group instead of removing and adding it.
  useLayoutEffect(() => {
    setLogicalGrouping(partGroupKey, { activityKeys: Object.freeze(Array.from(activityKeys)), isCollapsed });
  }, [activityKeys, isCollapsed, partGroupKey, setLogicalGrouping]);

  useLayoutEffect(() => () => removeLogicalGrouping(partGroupKey), [partGroupKey, removeLogicalGrouping]);

  return partGroupKey;
}

export default usePartGroupingLogicalGroup;
export { type UsePartGroupingLogicalGroupOptions };
