import { type ReactNode } from 'react';
import useRenderingElementsContext from './private/useRenderingElementsContext';

export default function useRenderedActivities(): readonly [ReactNode] {
  return useRenderingElementsContext().renderedActivitiesState;
}
