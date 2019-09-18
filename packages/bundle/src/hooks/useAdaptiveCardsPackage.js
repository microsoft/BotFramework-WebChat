import { useContext } from 'react';

import AdaptiveCardsContext from '../AdaptiveCardsContext';

export default function useAdaptiveCardsPackage() {
  const { adaptiveCardsPackage } = useContext(AdaptiveCardsContext);

  return [
    adaptiveCardsPackage,
    () => {
      throw new Error('AdaptiveCards must be set using props');
    }
  ];
}
