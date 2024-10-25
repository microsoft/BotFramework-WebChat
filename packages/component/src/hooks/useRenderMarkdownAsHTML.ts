import { cx } from '@emotion/css';
import { hooks, StrictStyleOptions } from 'botframework-webchat-api';
import { useMemo } from 'react';

import useCodeBlockCopyButtonTagName from '../providers/CustomElements/useCodeBlockCopyButtonTagName';
import parseDocumentFragmentFromString from '../Utils/parseDocumentFragmentFromString';
import serializeDocumentFragmentIntoString from '../Utils/serializeDocumentFragmentIntoString';
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
  const [codeBlockCopyButtonTagName] = useCodeBlockCopyButtonTagName();
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
        const htmlAfterSanitization = renderMarkdown(markdown, styleOptions, {
          codeBlockCopyButtonTagName,
          containerClassName,
          externalLinkAlt
        });

        const documentFragmentAfterSanitization = parseDocumentFragmentFromString(htmlAfterSanitization);

        const rootElement = document.createElement('div');

        containerClassName && rootElement.classList.add(...containerClassName.split(' ').filter(Boolean));

        rootElement.append(...documentFragmentAfterSanitization.childNodes);
        documentFragmentAfterSanitization.append(rootElement);

        return serializeDocumentFragmentIntoString(documentFragmentAfterSanitization);
      }),
    [codeBlockCopyButtonTagName, containerClassName, externalLinkAlt, renderMarkdown, styleOptions]
  );
}
