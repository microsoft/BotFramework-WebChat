import { useContext } from 'react';

import SendBoxAttachmentsContext, { type SendBoxAttachmentsContextType } from './private/SendBoxAttachmentsContext';

export default function useSendBoxAttachmentsHooks(): SendBoxAttachmentsContextType {
  return useContext(SendBoxAttachmentsContext);
}
