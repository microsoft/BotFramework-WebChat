import { useContext } from 'react';

import { useSelector } from '../WebChatReduxContext';
import WebChatUIContext from '../WebChatUIContext';

export default function useDictateInterims() {
  return [useSelector(({ dictateInterims }) => dictateInterims) || [], useContext(WebChatUIContext).setDictateInterims];
}
