import { createContext, type ReactNode } from 'react';

type RenderingElementsContextType = Readonly<{
  grouping: string;
  numRenderingActivitiesState: readonly [number];
  renderedActivitiesState: readonly [ReactNode];
}>;

const RenderingElementsContext = createContext<RenderingElementsContextType>(
  new Proxy({} as RenderingElementsContextType, {
    get() {
      throw new Error('botframework-webchat: This hook can only be used under <RenderingElementsComposer>');
    }
  })
);

export default RenderingElementsContext;
export { type RenderingElementsContextType };
