import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function usePostActivity() {
  return useContext(WebChatUIContext).postActivity;
}
