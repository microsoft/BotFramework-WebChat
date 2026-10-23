import createContextAndHook from '../../createContextAndHook';

type LogicalGrouping = {
  readonly activityKeys: readonly string[];
  readonly isCollapsed: boolean;
};

type ActivityLogicalGroupingContextType = {
  readonly getGroupBoundaries: (groupKey: string) => [string | undefined, string | undefined];
  readonly getGroupIsCollapsed: (groupKey: string) => boolean | undefined;
  readonly getLogicalGroupKey: (activityKey: string) => string | undefined;
  readonly removeLogicalGrouping: (key: string) => void;
  /** Adds the logical grouping, or replaces the one with the same key. */
  readonly setLogicalGrouping: (key: string, grouping: LogicalGrouping) => void;
  readonly subscribeGroupIsCollapsed: (groupKey: string, listener: () => void) => () => void;
  readonly subscribeLogicalGroupKey: (activityKey: string, listener: () => void) => () => void;
};

const { contextComponentType, useContext } = createContextAndHook<ActivityLogicalGroupingContextType>(
  'ActivityLogicalGroupingContext'
);

export default contextComponentType;
export {
  useContext as useActivityLogicalGroupingContext,
  type ActivityLogicalGroupingContextType,
  type LogicalGrouping
};
