import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useStyleOptions() {
  return useContext(WebChatUIContext).styleOptions;
}
