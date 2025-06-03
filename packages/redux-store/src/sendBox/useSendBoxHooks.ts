import { useContext } from 'react';

import SendBoxContext, { type SendBoxContextType } from './private/SendBoxContext';

export default function useSendBoxHooks(): SendBoxContextType {
  return useContext(SendBoxContext);
}
