import { useActivityLogicalGroupingContext, type LogicalGrouping } from './private/ActivityLogicalGroupingContext';

export default function useAddLogicalGrouping(): (grouping: LogicalGrouping) => void {
  return useActivityLogicalGroupingContext().addLogicalGrouping;
}
