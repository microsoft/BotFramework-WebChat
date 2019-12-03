import { useCallback, useContext, useRef } from 'react';

import useStyleOptions from '../hooks/useStyleOptions';
import WebChatUIContext from '../WebChatUIContext';

export default function useRenderMarkdownAsHTML() {
  const { renderMarkdown } = useContext(WebChatUIContext);
  const [styleOptions] = useStyleOptions();

  return useCallback(markdown => renderMarkdown(markdown, styleOptions), [renderMarkdown, styleOptions]);
}
