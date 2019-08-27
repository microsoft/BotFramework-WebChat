import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useSetDictateState() {
  return useContext(WebChatContext).setDictateState;
}
