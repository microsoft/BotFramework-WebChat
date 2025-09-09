import createContextAndHook from '../../createContextAndHook';

type GroupState = Readonly<{
  isCollapsed: boolean;
}>;

type LogicalGrouping = Readonly<{
  activityKeys: string[];
  getGroupState?: () => GroupState;
  key: string;
}>;

type ActivityLogicalGroupingContextType = Readonly<{
  addLogicalGrouping: (grouping: LogicalGrouping) => void;
  getGroupBoundaries: (groupKey: string) => [string | undefined, string | undefined];
  getGroupState: (groupKey: string) => GroupState | undefined;
  getLogicalGroupKey: (activityKey: string) => string | undefined;
  removeLogicalGrouping: (key: string) => void;
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
