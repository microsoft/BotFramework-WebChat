import { type ReactNode } from 'react';
import useGroupedRenderingActivitiesContext from './private/useGroupedRenderingActivitiesContext';

export default function useRenderedActivities(): readonly [ReactNode] {
  return useGroupedRenderingActivitiesContext().renderedActivitiesState;
}
