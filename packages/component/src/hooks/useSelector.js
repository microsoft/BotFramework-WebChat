import { createSelectorHook } from 'react-redux';

import WebChatReduxContext from '../WebChatReduxContext';

const useSelector = createSelectorHook(WebChatReduxContext);

export default useSelector;
