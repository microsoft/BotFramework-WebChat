import { hooks } from 'botframework-webchat-api';
import { useMemo } from 'react';

import useWebChatUIContext from './internal/useWebChatUIContext';

const { useLocalizer, useStyleOptions } = hooks;

export default function useRenderMarkdownAsHTML() {
  const { renderMarkdown } = useWebChatUIContext();
  const [styleOptions] = useStyleOptions();
  const localize = useLocalizer();

  const externalLinkAlt = localize('MARKDOWN_EXTERNAL_LINK_ALT');

  return useMemo(() => renderMarkdown && (markdown => renderMarkdown(markdown, styleOptions, { externalLinkAlt })), [
    externalLinkAlt,
    renderMarkdown,
    styleOptions
  ]);
}
