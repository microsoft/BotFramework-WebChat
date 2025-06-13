import { useContext } from 'react';

import WhileConnectedContext, { type WhileConnectedContextType } from './private/WhileConnectedContext';

export default function useWhileConnectedHooks(): WhileConnectedContextType {
  return useContext(WhileConnectedContext);
}
