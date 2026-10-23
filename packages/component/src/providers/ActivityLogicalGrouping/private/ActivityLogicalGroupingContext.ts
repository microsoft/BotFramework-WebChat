import createContextAndHook from '../../createContextAndHook';

type GroupState = {
  readonly isCollapsed: boolean;
};

type LogicalGrouping = {
  readonly activityKeys: readonly string[];
  /** Compared by identity: pass the same object until the state changes, so `useGroupState()` does not re-render. */
  readonly groupState?: GroupState | undefined;
  readonly key: string;
};

type ActivityLogicalGroupingContextType = {
  readonly addLogicalGrouping: (grouping: LogicalGrouping) => void;
  readonly getGroupBoundaries: (groupKey: string) => [string | undefined, string | undefined];
  readonly getGroupState: (groupKey: string) => GroupState | undefined;
  readonly getLogicalGroupKey: (activityKey: string) => string | undefined;
  readonly removeLogicalGrouping: (key: string) => void;
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
