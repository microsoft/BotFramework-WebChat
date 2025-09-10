import { useActivityLogicalGroupingContext, type GroupState } from './private/ActivityLogicalGroupingContext';

export default function useGetGroupState(): (groupKey: string) => GroupState | undefined {
  return useActivityLogicalGroupingContext().getGroupState;
}
