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

type ActivityLogicalGroupingContextType = Readonly<{
  addLogicalGrouping: (grouping: LogicalGrouping) => void;
  getGroupBoundaries: (groupKey: string) => [string | undefined, string | undefined];
  getGroupState: (groupKey: string) => GroupState | undefined;
  getLogicalGroupKey: (activityKey: string) => string | undefined;
  removeLogicalGrouping: (key: string) => void;
  subscribeGroupState: (groupKey: string, listener: () => void) => () => void;
  subscribeLogicalGroupKey: (activityKey: string, listener: () => void) => () => void;
}>;

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
