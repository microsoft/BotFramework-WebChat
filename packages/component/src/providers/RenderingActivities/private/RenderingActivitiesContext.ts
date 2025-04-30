import { createContext } from 'react';
import { type ActivityWithRenderer } from '../ActivityWithRenderer';

type RenderingActivitiesContextType = Readonly<{
  activitiesWithRenderer: readonly ActivityWithRenderer[];
  renderingActivityKeysState: readonly [readonly string[]];
}>;

const RenderingActivitiesContext = createContext<RenderingActivitiesContextType>(
  new Proxy({} as RenderingActivitiesContextType, {
    get() {
      throw new Error('botframework-webchat internal: This hook can only be used under <RenderingActivitiesContext>');
    }
  })
);

RenderingActivitiesContext.displayName = 'RenderingActivitiesContext';

export default RenderingActivitiesContext;
export type { RenderingActivitiesContextType };
