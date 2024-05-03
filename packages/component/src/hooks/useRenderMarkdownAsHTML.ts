import { cx } from '@emotion/css';
import { hooks, StrictStyleOptions } from 'botframework-webchat-api';
import { useMemo } from 'react';

import useWebChatUIContext from './internal/useWebChatUIContext';
import useStyleSet from './useStyleSet';

const { useLocalizer, useStyleOptions } = hooks;

export default function useRenderMarkdownAsHTML(
  mode: 'message activity' | 'adaptive cards' | 'citation modal' = 'message activity'
):
  | ((
      markdown: string,
      styleOptions?: Readonly<StrictStyleOptions>,
      options?: Readonly<{ containerClassName: string; externalLinkAlt: string }>
    ) => string)
  | undefined {
  const { renderMarkdown } = useWebChatUIContext();
  const [styleOptions] = useStyleOptions();
  const [{ renderMarkdown: renderMarkdownStyleSet }] = useStyleSet();
  const localize = useLocalizer();

  const externalLinkAlt = localize('MARKDOWN_EXTERNAL_LINK_ALT');

  const containerClassName = useMemo(
    () =>
      cx(
        'webchat__render-markdown',
        {
          'webchat__render-markdown--adaptive-cards': mode === 'adaptive cards',
          'webchat__render-markdown--citation': mode === 'citation modal',
          'webchat__render-markdown--message-activity': mode !== 'adaptive cards' && mode !== 'citation modal'
        },
        renderMarkdownStyleSet + ''
      ),
    [mode, renderMarkdownStyleSet]
  );

  return useMemo(
    () =>
      renderMarkdown && (markdown => renderMarkdown(markdown, styleOptions, { containerClassName, externalLinkAlt })),
    [containerClassName, externalLinkAlt, renderMarkdown, styleOptions]
  );
}
