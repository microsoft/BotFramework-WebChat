import useGroupedRenderingActivitiesContext from './private/useGroupedRenderingActivitiesContext';

export default function useNumRenderingActivities(): readonly [number] {
  return useGroupedRenderingActivitiesContext().numRenderingActivitiesState;
}
