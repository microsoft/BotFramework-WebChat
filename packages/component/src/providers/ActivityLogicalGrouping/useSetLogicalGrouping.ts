import { useActivityLogicalGroupingContext, type LogicalGrouping } from './private/ActivityLogicalGroupingContext';

export default function useSetLogicalGrouping(): (key: string, grouping: LogicalGrouping) => void {
  return useActivityLogicalGroupingContext().setLogicalGrouping;
}
