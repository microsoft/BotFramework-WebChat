import { createContext, type ReactNode } from 'react';

type GroupedRenderingActivitiesContextType = Readonly<{
  grouping: string;
  numRenderingActivitiesState: readonly [number];
  renderedActivitiesState: readonly [ReactNode];
}>;

const GroupedRenderingActivitiesContext = createContext<GroupedRenderingActivitiesContextType>(
  new Proxy({} as GroupedRenderingActivitiesContextType, {
    get() {
      throw new Error('botframework-webchat: This hook can only be used under <GroupedRenderingActivitiesComposer>');
    }
  })
);

GroupedRenderingActivitiesContext.displayName = 'GroupedRenderingActivitiesContext';

export default GroupedRenderingActivitiesContext;
export { type GroupedRenderingActivitiesContextType };
