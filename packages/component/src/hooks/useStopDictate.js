import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useStopDictate() {
  return useContext(WebChatContext).stopDictate;
}
