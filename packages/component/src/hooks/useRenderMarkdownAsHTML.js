import { useMemo } from 'react';

import useStyleOptions from '../hooks/useStyleOptions';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useRenderMarkdownAsHTML() {
  const { renderMarkdown } = useWebChatUIContext();
  const [styleOptions] = useStyleOptions();

  return useMemo(() => renderMarkdown && (markdown => renderMarkdown(markdown, styleOptions)), [
    renderMarkdown,
    styleOptions
  ]);
}
