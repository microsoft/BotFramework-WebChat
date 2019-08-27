import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useStartDictate() {
  return useContext(WebChatContext).startDictate;
}
