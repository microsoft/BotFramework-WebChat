import { cx } from '@emotion/css';
import { hooks, StrictStyleOptions } from 'botframework-webchat-api';
import { useMemo } from 'react';

import { useTransformHTMLContent } from '../providers/HTMLContentTransformCOR/index';
import parseDocumentFragmentFromString from '../Utils/parseDocumentFragmentFromString';
import serializeDocumentFragmentIntoString from '../Utils/serializeDocumentFragmentIntoString';
import useWebChatUIContext from './internal/useWebChatUIContext';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';

import styles from './RenderMarkdown.module.css';

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
  const localize = useLocalizer();
  const transformHTMLContent = useTransformHTMLContent();

  const classNames = useStyles(styles);

  const externalLinkAlt = localize('MARKDOWN_EXTERNAL_LINK_ALT');

  const containerClassName = useMemo(
    () =>
      cx(classNames['render-markdown'], {
        [classNames['render-markdown--adaptive-cards']]: mode === 'adaptive cards',
        [classNames['render-markdown--citation']]: mode === 'citation modal',
        [classNames['render-markdown--message-activity']]:
          mode !== 'accessible name' && mode !== 'adaptive cards' && mode !== 'citation modal'
      }),
    [classNames, mode]
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
