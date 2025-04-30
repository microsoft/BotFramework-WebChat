import { createContext, type MutableRefObject } from 'react';

type TranscriptDOMContextType = Readonly<{
  activityElementRef: MutableRefObject<Map<string, HTMLElement>>;
}>;

const TranscriptDOMContext = createContext<TranscriptDOMContextType>(
  new Proxy({} as TranscriptDOMContextType, {
    get() {
      throw new Error(`botframework-webchat: This hook can only be used under <TranscriptDOMComposer>`);
    }
  })
);

export default TranscriptDOMContext;
export { type TranscriptDOMContextType };
