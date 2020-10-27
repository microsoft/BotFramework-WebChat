import { hooks } from 'botframework-webchat-api';
import { useMemo } from 'react';

import useWebChatUIContext from './internal/useWebChatUIContext';

const { useStyleOptions } = hooks;

export default function useRenderMarkdownAsHTML() {
  const { renderMarkdown } = useWebChatUIContext();
  const [styleOptions] = useStyleOptions();

  return useMemo(() => renderMarkdown && (markdown => renderMarkdown(markdown, styleOptions)), [
    renderMarkdown,
    styleOptions
  ]);
}
