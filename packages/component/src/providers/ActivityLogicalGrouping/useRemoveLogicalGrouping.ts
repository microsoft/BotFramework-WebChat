import { useActivityLogicalGroupingContext } from './private/ActivityLogicalGroupingContext';

export default function useRemoveLogicalGrouping(): (key: string) => void {
  return useActivityLogicalGroupingContext().removeLogicalGrouping;
}
