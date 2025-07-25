import React, { memo, useCallback, useMemo, useState, type ReactNode } from 'react';

import ActivityLogicalGroupingContext, {
  type ActivityLogicalGroupingContextType,
  type LogicalGrouping,
  type GroupState
} from './private/ActivityLogicalGroupingContext';
import { useRefFrom } from 'use-ref-from';
import useMemoWithPrevious from '../../hooks/internal/useMemoWithPrevious';

type ActivityLogicalGroupingComposerProps = Readonly<{
  children?: ReactNode | undefined;
}>;

const ActivityLogicalGroupingComposer = ({ children }: ActivityLogicalGroupingComposerProps) => {
  const [logicalGroupings, setLogicalGroupings] = useState<readonly LogicalGrouping[]>([]);
  const logicalGroupingsRef = useRefFrom(logicalGroupings);

  // Create a map from activity key to group key for quick lookups with reference stability
  const activityToGroupMap = useMemoWithPrevious(
    (prevMap?: ReadonlyMap<string, string>) => {
      const newMap = new Map<string, string>();

      logicalGroupings.forEach(group => {
        group.activityKeys.forEach(activityKey => {
          activityKey && newMap.set(activityKey, group.id);
        });
      });

      // Check if the map content has actually changed
      if (prevMap && prevMap.size === newMap.size) {
        let hasChanged = false;
        for (const [key, value] of newMap) {
          if (prevMap.get(key) !== value) {
            hasChanged = true;
            break;
          }
        }

        if (!hasChanged) {
          // Return the previous map to maintain reference stability
          return prevMap;
        }
      }

      return newMap;
    },
    [logicalGroupings]
  );

  const activityToGroupMapRef = useRefFrom(activityToGroupMap);

  const addLogicalGrouping = useCallback((grouping: LogicalGrouping) => {
    setLogicalGroupings(prev => {
      // Remove any existing grouping with the same ID and add the new one
      const filtered = prev.filter(existing => existing.id !== grouping.id);
      return Object.freeze([...filtered, grouping]);
    });
  }, []);

  const getLogicalGroupKey = useCallback(
    (activityKey: string): string | undefined => activityToGroupMapRef.current.get(activityKey),
    [activityToGroupMapRef]
  );

  const shouldFocusLogicalGroup = useCallback(
    (activityKey: string): boolean => {
      const groupKey = activityToGroupMapRef.current.get(activityKey);
      if (!groupKey) {
        return false;
      }

      const group = logicalGroupingsRef.current.find(g => g.id === groupKey);
      if (!group || !group.getGroupState) {
        return false;
      }

      const groupState = group.getGroupState();
      return !groupState.isCollapsed;
    },
    [activityToGroupMapRef, logicalGroupingsRef]
  );

  const getGroupState = useCallback(
    (groupKey: string): GroupState | undefined => {
      const group = logicalGroupingsRef.current.find(g => g.id === groupKey);
      return group?.getGroupState?.();
    },
    [logicalGroupingsRef]
  );

  const getGroupBoundaries = useCallback(
    (groupKey: string): [string, string] => {
      const group = logicalGroupingsRef.current.find(g => g.id === groupKey);
      if (!group || !group.activityKeys.length) {
        return [undefined, undefined];
      }
      // eslint-disable-next-line no-magic-numbers
      return [group.activityKeys.at(0), group.activityKeys.at(-1)];
    },
    [logicalGroupingsRef]
  );

  const activityToGroupMapState = useMemo<readonly [ReadonlyMap<string, string>]>(
    () => Object.freeze([activityToGroupMap] as const),
    [activityToGroupMap]
  );

  const contextValue: ActivityLogicalGroupingContextType = useMemo(
    () => ({
      addLogicalGrouping,
      getLogicalGroupKey,
      shouldFocusLogicalGroup,
      getGroupState,
      getGroupBoundaries,
      activityToGroupMapState
    }),
    [
      addLogicalGrouping,
      getLogicalGroupKey,
      shouldFocusLogicalGroup,
      getGroupState,
      getGroupBoundaries,
      activityToGroupMapState
    ]
  );

  return React.createElement(ActivityLogicalGroupingContext.Provider, { value: contextValue }, children);
};

ActivityLogicalGroupingComposer.displayName = 'ActivityLogicalGroupingComposer';

export default memo(ActivityLogicalGroupingComposer);
export { type ActivityLogicalGroupingComposerProps };
