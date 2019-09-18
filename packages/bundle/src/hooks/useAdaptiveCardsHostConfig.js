import { useContext } from 'react';

import AdaptiveCardsContext from '../AdaptiveCardsContext';

export default function useAdaptiveCardsHostConfig() {
  const { hostConfig } = useContext(AdaptiveCardsContext);

  return [
    hostConfig,
    () => {
      throw new Error('AdaptiveCardsHostConfig must be set using props');
    }
  ];
}
