import { createContext } from 'react';

import AdaptiveCardsPackage from '../types/AdaptiveCardsPackage';

type AdaptiveCardsContext = {
  adaptiveCardsPackage: AdaptiveCardsPackage;
  hostConfigFromProps: any;
};

const AdaptiveCardsContext = createContext<AdaptiveCardsContext>(undefined);

export default AdaptiveCardsContext;
