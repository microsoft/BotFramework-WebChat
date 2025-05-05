import { useContext } from 'react';
import GroupActivitiesContext, { type GroupActivitiesContextType } from './GroupActivitiesContext';

export default function useGroupActivitiesContext(): GroupActivitiesContextType {
  return useContext(GroupActivitiesContext);
}
