import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useSetDictateInterims() {
  return useContext(WebChatContext).dictateInterims;
}
