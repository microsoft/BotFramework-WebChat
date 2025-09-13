import { createContext } from 'react';

import { type AdaptiveCardsPackage } from '../types/AdaptiveCardsPackage';

type AdaptiveCardsContextType = {
  adaptiveCardsPackage: AdaptiveCardsPackage;
  hostConfigFromProps: any;
};

const AdaptiveCardsContext = createContext<AdaptiveCardsContextType>(undefined);

export default AdaptiveCardsContext;
export type { AdaptiveCardsContextType };
