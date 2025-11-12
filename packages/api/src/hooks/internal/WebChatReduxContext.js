import { createContext } from 'react';
import { createDispatchHook, createSelectorHook, createStoreHook } from 'react-redux';

const context = createContext();

const useDispatch = createDispatchHook(context);
const useSelector = createSelectorHook(context);
const useStore = createStoreHook(context);

context.displayName = 'WebChatReduxContext';

export default context;

export { useDispatch, useSelector, useStore };
