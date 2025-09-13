import { useContext } from 'react';

import AdaptiveCardsContext, { type AdaptiveCardsContextType } from '../../AdaptiveCardsContext';

export default function useAdaptiveCardsContext(): AdaptiveCardsContextType {
  const context = useContext(AdaptiveCardsContext);

  if (!context) {
    throw new Error('This hook can only be used on component that is decendants of <ComposerWithAdaptiveCards>');
  }

  return context;
}
