import type { ActivityWithRenderer } from './private/types';
import useContext from './private/useContext';

export default function useActivitiesWithRenderer(): readonly ActivityWithRenderer[] {
  return useContext().activitiesWithRenderer;
}
