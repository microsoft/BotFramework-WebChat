import { createSelectorHook } from 'react-redux';
// import { createDispatchHook, createSelectorHook } from 'react-redux';
import { useContext } from 'react';

import WebChatReduxContext from './WebChatReduxContext';
import WebChatContext from './Context';

// const useDispatch = createDispatchHook(WebChatReduxContext);
const useSelector = createSelectorHook(WebChatReduxContext);

export default function useWebChat(selector) {
  const context = useContext(WebChatContext);
  // const dispatch = useDispatch();
  const state = useSelector(state => state);

  return selector({ ...state, ...context });
  // return selector({ ...state, ...context, dispatch });
}
