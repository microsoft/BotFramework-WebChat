import { useGroupedRenderingActivitiesContext } from './private/GroupedRenderingActivitiesContext';

export default function useNumRenderingActivities(): readonly [number] {
  return useGroupedRenderingActivitiesContext().numRenderingActivitiesState;
}
