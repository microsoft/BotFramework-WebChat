import { createContext } from 'react';
import { createDispatchHook, createSelectorHook } from 'react-redux';

const context = createContext();

const useDispatch = createDispatchHook(context);
const useSelector = createSelectorHook(context);

context.displayName = 'WebChatReduxContext';

export default context;

export { useDispatch, useSelector };
