import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useScrollToEnd() {
  return useContext(WebChatContext).scrollToEnd;
}
