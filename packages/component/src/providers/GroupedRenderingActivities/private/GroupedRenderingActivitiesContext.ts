import { type ReactNode } from 'react';
import createContextAndHook from '../../createContextAndHook';

type GroupedRenderingActivitiesContextType = Readonly<{
  grouping: string;
  numRenderingActivitiesState: readonly [number];
  renderedActivitiesState: readonly [ReactNode];
}>;

const { contextComponentType, useContext } = createContextAndHook<GroupedRenderingActivitiesContextType>(
  'GroupedRenderingActivitiesContext'
);

export default contextComponentType;
export { useContext as useGroupedRenderingActivitiesContext, type GroupedRenderingActivitiesContextType };
