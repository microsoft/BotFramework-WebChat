import { type ActivityWithRenderer } from './ActivityWithRenderer';
import useRenderingActivitiesContext from './private/useRenderingActivitiesContext';

export default function useActivitiesWithRenderer(): readonly ActivityWithRenderer[] {
  return useRenderingActivitiesContext().activitiesWithRenderer;
}
