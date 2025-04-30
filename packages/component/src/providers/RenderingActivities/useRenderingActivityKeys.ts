import useRenderingActivitiesContext from './private/useRenderingActivitiesContext';

export default function useRenderingActivityKeys(): readonly [readonly string[]] {
  return useRenderingActivitiesContext().renderingActivityKeysState;
}
