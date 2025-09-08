import random from 'math-random';
import { useCallback, useEffect, useMemo } from 'react';
import { useRefFrom } from 'use-ref-from';
import { useStateWithRef } from 'use-state-with-ref';

import { useAddLogicalGrouping, useRemoveLogicalGrouping } from '../../../../../providers/ActivityLogicalGrouping';

type UsePartGroupingLogicalGroupOptions = {
  activityKeys: readonly string[];
  isCollapsed: boolean;
};

function usePartGroupingLogicalGroup({ activityKeys, isCollapsed }: UsePartGroupingLogicalGroupOptions): string {
  // eslint-disable-next-line no-magic-numbers
  const [partGroupKey, _setPartKey, partKeyRef] = useStateWithRef(() => `part-${random().toString(36).slice(2, 11)}`);
  const addLogicalGrouping = useAddLogicalGrouping();
  const removeLogicalGrouping = useRemoveLogicalGrouping();

  const isCollapsedRef = useRefFrom(isCollapsed);

  const getGroupState = useCallback(() => ({ isCollapsed: isCollapsedRef.current }), [isCollapsedRef]);

  useMemo(
    () =>
      addLogicalGrouping({
        key: partKeyRef.current,
        activityKeys: Array.from(activityKeys),
        getGroupState
      }),
    [activityKeys, addLogicalGrouping, getGroupState, partKeyRef]
  );

  const removeLogicalGroupingRef = useRefFrom(removeLogicalGrouping);

  useEffect(() => () => removeLogicalGroupingRef.current(partKeyRef.current), [partKeyRef, removeLogicalGroupingRef]);

  return partGroupKey;
}

export default usePartGroupingLogicalGroup;
export { type UsePartGroupingLogicalGroupOptions };
