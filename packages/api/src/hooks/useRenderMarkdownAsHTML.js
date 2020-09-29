import { useMemo } from 'react';

import useStyleOptions from '../hooks/useStyleOptions';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useRenderMarkdownAsHTML() {
  const { renderMarkdown } = useWebChatAPIContext();
  const [styleOptions] = useStyleOptions();

  return useMemo(() => renderMarkdown && (markdown => renderMarkdown(markdown, styleOptions)), [
    renderMarkdown,
    styleOptions
  ]);
}
