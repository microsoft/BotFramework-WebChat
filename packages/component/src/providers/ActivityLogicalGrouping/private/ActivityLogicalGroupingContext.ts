import { type ReadonlyKeyedStore } from '../../../hooks/internal/createKeyedStore';
import createContextAndHook from '../../createContextAndHook';

type LogicalGrouping = {
  readonly activityKeys: readonly string[];
  readonly isCollapsed: boolean;
};

type ActivityLogicalGroupingContextType = {
  /** Group key by activity key. Read with `useLogicalGroupKey()` while rendering, or `get()` at event time. */
  readonly logicalGroupKeyStore: ReadonlyKeyedStore<string>;
  /** Logical grouping by group key. */
  readonly logicalGroupingStore: ReadonlyKeyedStore<LogicalGrouping>;
  readonly removeLogicalGrouping: (key: string) => void;
  /** Adds the logical grouping, or replaces the one with the same key. */
  readonly setLogicalGrouping: (key: string, grouping: LogicalGrouping) => void;
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
