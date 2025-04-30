import { useContext } from 'react';

import GroupedRenderingActivitiesContext, {
  type GroupedRenderingActivitiesContextType
} from './GroupedRenderingActivitiesContext';

export default function useGroupedRenderingActivitiesContext(): GroupedRenderingActivitiesContextType {
  return useContext(GroupedRenderingActivitiesContext);
}
