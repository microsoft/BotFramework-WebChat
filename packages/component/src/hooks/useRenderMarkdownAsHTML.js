import { useContext } from 'react';

import WebChatUIContext from '../WebChatUIContext';

export default function useRenderMarkdownAsHTML() {
  return useContext(WebChatUIContext).renderMarkdown;
}
