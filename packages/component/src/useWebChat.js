import { createSelectorHook } from 'react-redux';
import { useContext } from 'react';

import WebChatReduxContext from './WebChatReduxContext';
import WebChatContext from './Context';

const useSelector = createSelectorHook(WebChatReduxContext);

export default function useWebChat(selector) {
  const context = useContext(WebChatContext);
  const state = useSelector(state => state);

  return selector({ ...state, ...context });
}
