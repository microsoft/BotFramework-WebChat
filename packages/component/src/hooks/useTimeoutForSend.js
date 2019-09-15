import { useContext } from 'react';

import { useSelector } from '../WebChatReduxContext';
import WebChatUIContext from '../WebChatUIContext';

export default function useTimeoutForSend() {
  return [useSelector(({ sendTimeout }) => sendTimeout), useContext(WebChatUIContext).setSendTimeout];
}
