import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useRenderMarkdown() {
  return useContext(WebChatContext).renderMarkdown;
}
