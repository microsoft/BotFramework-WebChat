import createContextAndHook from '../../createContextAndHook';

type GroupState = Readonly<{
  isCollapsed: boolean;
}>;

type LogicalGrouping = Readonly<{
  id: string;
  name: string;
  activityKeys: string[];
  getGroupState?: () => GroupState;
}>;

type ActivityLogicalGroupingContextType = Readonly<{
  addLogicalGrouping: (grouping: LogicalGrouping) => void;
  getLogicalGroupKey: (activityKey: string) => string | undefined;
  shouldFocusLogicalGroup: (activityKey: string) => boolean;
  getGroupState: (groupKey: string) => GroupState | undefined;
  getGroupBoundaries: (groupKey: string) => [string | undefined, string | undefined];
  activityToGroupMapState: readonly [ReadonlyMap<string, string>];
}>;

const { contextComponentType, useContext } = createContextAndHook<ActivityLogicalGroupingContextType>(
  'ActivityLogicalGroupingContext'
);

export default contextComponentType;
export {
  useContext as useActivityLogicalGroupingContext,
  type ActivityLogicalGroupingContextType,
  type LogicalGrouping,
  type GroupState
};
