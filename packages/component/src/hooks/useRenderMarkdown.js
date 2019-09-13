import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useRenderMarkdown() {
  return useContext(WebChatUIContext).renderMarkdown;
}
