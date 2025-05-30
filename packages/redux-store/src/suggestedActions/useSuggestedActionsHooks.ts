import { useContext } from 'react';

import SuggestedActionsContext, { type SuggestedActionsContextType } from './private/SuggestedActionsContext';

export default function useSuggestedActionsHooks(): SuggestedActionsContextType {
  return useContext(SuggestedActionsContext);
}
