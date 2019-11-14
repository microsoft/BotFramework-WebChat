import { createContext } from 'react';

const AdaptiveCardHostConfigContext = createContext({
  adaptiveCardsPackage: undefined,
  hostConfig: undefined
});

export default AdaptiveCardHostConfigContext;
