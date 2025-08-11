import { type GroupedRenderingActivities } from './GroupedRenderingActivities';
import { useGroupedRenderingActivitiesContext } from './private/GroupedRenderingActivitiesContext';

export default function useGroupedRenderingActivities(): readonly [readonly GroupedRenderingActivities[]] {
  return useGroupedRenderingActivitiesContext().groupedRenderingActivitiesState;
}
