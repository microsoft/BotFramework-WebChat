import random from 'math-random';
import { useCallback, useLayoutEffect, useState } from 'react';
import { useRefFrom } from 'use-ref-from';

import { useAddLogicalGrouping, useRemoveLogicalGrouping } from '../../../../../providers/ActivityLogicalGrouping';

type UsePartGroupingLogicalGroupOptions = {
  activityKeys: readonly string[];
  isCollapsed: boolean;
};

function usePartGroupingLogicalGroup({ activityKeys, isCollapsed }: UsePartGroupingLogicalGroupOptions): string {
  // eslint-disable-next-line no-magic-numbers
  const [partGroupKey] = useState(() => `part-${random().toString(36).slice(2, 11)}`);
  const addLogicalGrouping = useAddLogicalGrouping();
  const removeLogicalGrouping = useRemoveLogicalGrouping();

  const isCollapsedRef = useRefFrom(isCollapsed);

  const getGroupState = useCallback(() => ({ isCollapsed: isCollapsedRef.current }), [isCollapsedRef]);

  // Adds the group in an effect, not while rendering: Strict Mode runs the cleanup below, then runs this effect again.
  // A layout effect, so activities using `useLogicalGroupKey()` re-render before the browser paints.
  useLayoutEffect(() => {
    addLogicalGrouping({
      activityKeys: Array.from(activityKeys),
      getGroupState,
      key: partGroupKey
    });
  }, [activityKeys, addLogicalGrouping, getGroupState, partGroupKey]);

  useLayoutEffect(() => () => removeLogicalGrouping(partGroupKey), [partGroupKey, removeLogicalGrouping]);

  return partGroupKey;
}

export default usePartGroupingLogicalGroup;
export { type UsePartGroupingLogicalGroupOptions };
