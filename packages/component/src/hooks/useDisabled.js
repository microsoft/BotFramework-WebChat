import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useDisabled() {
  return [useContext(WebChatUIContext).disabled];
}
