import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useMarkActivity() {
  return useContext(WebChatUIContext).markActivity;
}
