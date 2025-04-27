import useRenderingElementsContext from './private/useRenderingElementsContext';

export default function useNumRenderingActivities(): readonly [number] {
  return useRenderingElementsContext().numRenderingActivitiesState;
}
