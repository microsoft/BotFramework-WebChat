import { useContext } from 'react';

import AdaptiveCardsContext from '../../AdaptiveCardsContext';

export default function useAdaptiveCardsContext() {
  const context = useContext(AdaptiveCardsContext);

  if (!context) {
    throw new Error('This hook can only be used on component that is decendants of <ComposerWithAdaptiveCards>');
  }

  return context;
}
