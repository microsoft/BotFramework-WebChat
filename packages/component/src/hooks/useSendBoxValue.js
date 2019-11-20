import { useContext } from 'react';

import { useSelector } from '../WebChatReduxContext';
import WebChatUIContext from '../WebChatUIContext';

export default function useSendBoxValue() {
  return [useSelector(({ sendBoxValue }) => sendBoxValue), useContext(WebChatUIContext).setSendBox];
}
