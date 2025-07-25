import { useActivityLogicalGroupingContext } from './private/ActivityLogicalGroupingContext';

export default function useGetLogicalGroupBoundaries(): (groupKey: string) => [string | undefined, string | undefined] {
  return useActivityLogicalGroupingContext().getGroupBoundaries;
}
