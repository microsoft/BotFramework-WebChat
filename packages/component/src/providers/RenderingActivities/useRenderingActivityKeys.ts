import { useRenderingActivitiesContext } from './private/RenderingActivitiesContext';

export default function useRenderingActivityKeys(): readonly [readonly string[]] {
  return useRenderingActivitiesContext().renderingActivityKeysState;
}
