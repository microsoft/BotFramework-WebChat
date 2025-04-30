import { type ActivityWithRenderer } from './ActivityWithRenderer';
import { useRenderingActivitiesContext } from './private/RenderingActivitiesContext';

export default function useActivitiesWithRenderer(): readonly ActivityWithRenderer[] {
  return useRenderingActivitiesContext().activitiesWithRenderer;
}
