import createContextAndHook from '../../createContextAndHook';
import { type GroupedRenderingActivities } from '../GroupedRenderingActivities';

type GroupedRenderingActivitiesContextType = Readonly<{
  groupedRenderingActivitiesState: readonly [readonly GroupedRenderingActivities[]];
  numRenderingActivitiesState: readonly [number];
}>;

const { contextComponentType, useContext } = createContextAndHook<GroupedRenderingActivitiesContextType>(
  'GroupedRenderingActivitiesContext'
);

export default contextComponentType;
export { useContext as useGroupedRenderingActivitiesContext, type GroupedRenderingActivitiesContextType };
