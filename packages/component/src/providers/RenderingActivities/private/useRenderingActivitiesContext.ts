import { useContext } from 'react';
import RenderingActivitiesContext, { type RenderingActivitiesContextType } from './RenderingActivitiesContext';

export default function useRenderingActivitiesContext(): RenderingActivitiesContextType {
  return useContext(RenderingActivitiesContext);
}
