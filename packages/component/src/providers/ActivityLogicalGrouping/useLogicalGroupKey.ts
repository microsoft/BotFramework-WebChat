import { useLayoutEffect, useMemo, useReducer, useRef } from 'react';

import { useActivityLogicalGroupingContext } from './private/ActivityLogicalGroupingContext';

function increment(value: number): number {
  return value + 1;
}

/**
 * Returns the key of the logical group the activity belongs to, or `undefined` if it is not part of any group.
 *
 * The component re-renders only when the group key of this activity changes.
 * Event handlers, which read the latest value at call time, should use `useGetLogicalGroupKey()` instead.
 */
export default function useLogicalGroupKey(activityKey: string): readonly [string | undefined] {
  const { getLogicalGroupKey, subscribeLogicalGrouping } = useActivityLogicalGroupingContext();
  const [, forceRender] = useReducer(increment, 0);

  const logicalGroupKey = getLogicalGroupKey(activityKey);
  const logicalGroupKeyRef = useRef<string | undefined>(logicalGroupKey);

  useLayoutEffect(() => {
    logicalGroupKeyRef.current = logicalGroupKey;
  });

  useLayoutEffect(() => {
    const handleChange = () => {
      const nextLogicalGroupKey = getLogicalGroupKey(activityKey);

      if (nextLogicalGroupKey !== logicalGroupKeyRef.current) {
        // Remembers the new value now, so another change before the re-render does not re-render again.
        logicalGroupKeyRef.current = nextLogicalGroupKey;

        forceRender();
      }
    };

    // Catches changes between render and subscription.
    handleChange();

    return subscribeLogicalGrouping(handleChange);
  }, [activityKey, forceRender, getLogicalGroupKey, logicalGroupKeyRef, subscribeLogicalGrouping]);

  return useMemo(() => Object.freeze([logicalGroupKey] as const), [logicalGroupKey]);
}
