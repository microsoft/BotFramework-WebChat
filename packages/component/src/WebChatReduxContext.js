import { createContext } from 'react';
import { createDispatchHook, createSelectorHook } from 'react-redux';

const WebChatReduxContext = createContext();

const useDispatch = createDispatchHook(WebChatReduxContext);
const useSelector = createSelectorHook(WebChatReduxContext);

export default WebChatReduxContext;

export { useDispatch, useSelector };
