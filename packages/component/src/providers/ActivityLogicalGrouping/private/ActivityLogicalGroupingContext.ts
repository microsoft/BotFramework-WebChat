import createContextAndHook from '../../createContextAndHook';

type GroupState = {
  readonly isCollapsed: boolean;
};

type LogicalGrouping = {
  readonly activityKeys: readonly string[];
  /** Compared by identity: pass the same object until the state changes, so `useGroupState()` does not re-render. */
  readonly groupState?: GroupState | undefined;
};

type ActivityLogicalGroupingContextType = {
  readonly getGroupBoundaries: (groupKey: string) => [string | undefined, string | undefined];
  readonly getGroupState: (groupKey: string) => GroupState | undefined;
  readonly getLogicalGroupKey: (activityKey: string) => string | undefined;
  readonly removeLogicalGrouping: (key: string) => void;
  /** Adds the logical grouping, or replaces the one with the same key. */
  readonly setLogicalGrouping: (key: string, grouping: LogicalGrouping) => void;
  readonly subscribeGroupState: (groupKey: string, listener: () => void) => () => void;
  readonly subscribeLogicalGroupKey: (activityKey: string, listener: () => void) => () => void;
};

const { contextComponentType, useContext } = createContextAndHook<ActivityLogicalGroupingContextType>(
  'ActivityLogicalGroupingContext'
);

export default contextComponentType;
export {
  useContext as useActivityLogicalGroupingContext,
  type ActivityLogicalGroupingContextType,
  type GroupState,
  type LogicalGrouping
};
