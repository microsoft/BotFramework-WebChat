import { cx } from '@emotion/css';
import { hooks, StrictStyleOptions } from 'botframework-webchat-api';
import { useMemo } from 'react';

import parseDocumentFromString from '../Utils/parseDocumentFromString';
import serializeDocumentIntoString from '../Utils/serializeDocumentIntoString';
import useWebChatUIContext from './internal/useWebChatUIContext';
import useStyleSet from './useStyleSet';

const { useLocalizer, useStyleOptions } = hooks;

export default function useRenderMarkdownAsHTML(
  mode: 'accessible name' | 'adaptive cards' | 'citation modal' | 'clipboard' | 'message activity' = 'message activity'
):
  | ((
      markdown: string,
      styleOptions?: Readonly<StrictStyleOptions>,
      options?: Readonly<{ externalLinkAlt: string }>
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
          'webchat__render-markdown--clipboard': mode === 'clipboard',
          'webchat__render-markdown--message-activity':
            mode !== 'accessible name' && mode !== 'adaptive cards' && mode !== 'citation modal' && mode !== 'clipboard'
        },
        renderMarkdownStyleSet + ''
      ),
    [mode, renderMarkdownStyleSet]
  );

  return useMemo(
    () =>
      renderMarkdown &&
      (markdown => {
        const htmlAfterSanitization = renderMarkdown(markdown, styleOptions, { containerClassName, externalLinkAlt });

        const documentAfterSanitization = parseDocumentFromString(htmlAfterSanitization);

        const rootElement = documentAfterSanitization.createElement('div');

        containerClassName && rootElement.classList.add(...containerClassName.split(' ').filter(Boolean));

        rootElement.append(...documentAfterSanitization.body.childNodes);
        documentAfterSanitization.body.append(rootElement);

        return serializeDocumentIntoString(documentAfterSanitization);
      }),
    [containerClassName, externalLinkAlt, renderMarkdown, styleOptions]
  );
}
