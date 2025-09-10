import { useActivityLogicalGroupingContext } from './private/ActivityLogicalGroupingContext';

export default function useGetLogicalGroupKey(): (activityKey: string) => string | undefined {
  return useActivityLogicalGroupingContext().getLogicalGroupKey;
}
