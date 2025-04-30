import { type ReactNode } from 'react';
import { useGroupedRenderingActivitiesContext } from './private/GroupedRenderingActivitiesContext';

export default function useRenderedActivities(): readonly [ReactNode] {
  return useGroupedRenderingActivitiesContext().renderedActivitiesState;
}
