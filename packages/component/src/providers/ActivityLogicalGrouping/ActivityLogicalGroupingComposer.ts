import { memo, createElement, useCallback, useMemo, type ReactNode, useRef } from 'react';

import ActivityLogicalGroupingContext, {
  type ActivityLogicalGroupingContextType,
  type LogicalGrouping,
  type GroupState
} from './private/ActivityLogicalGroupingContext';

type ActivityLogicalGroupingComposerProps = Readonly<{
  children?: ReactNode | undefined;
}>;

const ActivityLogicalGroupingComposer = ({ children }: ActivityLogicalGroupingComposerProps) => {
  const logicalGroupingsRef = useRef<Map<string, LogicalGrouping>>(new Map());
  const activityToGroupMapRef = useRef<ReadonlyMap<string, string | undefined>>(new Map());

  const addLogicalGrouping = useCallback(
    (grouping: LogicalGrouping) => {
      const prevGroupingKeys = logicalGroupingsRef.current.get(grouping.id)?.activityKeys ?? [];

      logicalGroupingsRef.current.set(grouping.id, grouping);

      const toRemoveSet = new Set(prevGroupingKeys).difference(new Set(grouping.activityKeys));
      const toAddSet = new Set(grouping.activityKeys).difference(new Set(prevGroupingKeys));

      activityToGroupMapRef.current = new Map([
        ...[...activityToGroupMapRef.current].filter(([, value]) => !!value && !toRemoveSet.has(value)),
        ...[...toAddSet].map(activityKey => [activityKey, grouping.id] as const)
      ]);
    },
    [logicalGroupingsRef]
  );

  const getLogicalGroupKey = useCallback(
    (activityKey: string): string | undefined => activityToGroupMapRef.current.get(activityKey),
    [activityToGroupMapRef]
  );

  const getGroupState = useCallback(
    (groupKey: string): GroupState | undefined => {
      const group = logicalGroupingsRef.current.get(groupKey);
      return group?.getGroupState?.();
    },
    [logicalGroupingsRef]
  );

  const getGroupBoundaries = useCallback(
    (groupKey: string): [string, string] => {
      const group = logicalGroupingsRef.current.get(groupKey);
      if (!group || !group.activityKeys.length) {
        return [undefined, undefined];
      }
      // eslint-disable-next-line no-magic-numbers
      return [group.activityKeys.at(0), group.activityKeys.at(-1)];
    },
    [logicalGroupingsRef]
  );

  const contextValue: ActivityLogicalGroupingContextType = useMemo(
    () => ({
      addLogicalGrouping,
      getLogicalGroupKey,
      getGroupState,
      getGroupBoundaries
    }),
    [addLogicalGrouping, getLogicalGroupKey, getGroupState, getGroupBoundaries]
  );

  return createElement(ActivityLogicalGroupingContext.Provider, { value: contextValue }, children);
};

ActivityLogicalGroupingComposer.displayName = 'ActivityLogicalGroupingComposer';

export default memo(ActivityLogicalGroupingComposer);
export { type ActivityLogicalGroupingComposerProps };
