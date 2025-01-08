import { cx } from '@emotion/css';
import { hooks, type StrictStyleOptions } from 'botframework-webchat-api';
import { useMemo } from 'react';

import { useTransformHTMLContent } from '../providers/HTMLContentTransformCOR/index';
import parseDocumentFragmentFromString from '../Utils/parseDocumentFragmentFromString';
import serializeDocumentFragmentIntoString from '../Utils/serializeDocumentFragmentIntoString';
import useWebChatUIContext from './internal/useWebChatUIContext';
import useStyleSet from './useStyleSet';

const { useLocalizer, useStyleOptions } = hooks;

export default function useRenderMarkdownAsHTML(
  mode: 'accessible name' | 'adaptive cards' | 'citation modal' | 'message activity' = 'message activity'
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
  const transformHTMLContent = useTransformHTMLContent();

  const externalLinkAlt = localize('MARKDOWN_EXTERNAL_LINK_ALT');

  const containerClassName = useMemo(
    () =>
      cx(
        'webchat__render-markdown',
        {
          'webchat__render-markdown--adaptive-cards': mode === 'adaptive cards',
          'webchat__render-markdown--citation': mode === 'citation modal',
          'webchat__render-markdown--message-activity':
            mode !== 'accessible name' && mode !== 'adaptive cards' && mode !== 'citation modal'
        },
        renderMarkdownStyleSet + ''
      ),
    [mode, renderMarkdownStyleSet]
  );

  return useMemo(
    () =>
      renderMarkdown &&
      (markdown => {
        const html = renderMarkdown(markdown, styleOptions, { externalLinkAlt });

        const documentFragment = transformHTMLContent(parseDocumentFragmentFromString(html));

        const rootElement = document.createElement('div');

        containerClassName && rootElement.classList.add(...containerClassName.split(' ').filter(Boolean));

        rootElement.append(...documentFragment.childNodes);
        documentFragment.append(rootElement);

        return serializeDocumentFragmentIntoString(documentFragment);
      }),
    [containerClassName, externalLinkAlt, renderMarkdown, styleOptions, transformHTMLContent]
  );
}
