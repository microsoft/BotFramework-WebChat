import { createDispatchHook, createSelectorHook } from 'react-redux';
import { useContext } from 'react';

import combineSelectors from './Utils/combineSelectors';
import WebChatReduxContext from './WebChatReduxContext';
import WebChatContext from './Context';

const useDispatch = createDispatchHook(WebChatReduxContext);
const useSelector = createSelectorHook(WebChatReduxContext);

export default function useWebChat(...selectors) {
  const context = useContext(WebChatContext);
  const dispatch = useDispatch();
  const state = useSelector(combineSelectors(selectors));

  return { ...state, ...context, dispatch };
}
