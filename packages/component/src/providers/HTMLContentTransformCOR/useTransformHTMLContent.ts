import { hooks } from 'botframework-webchat-api';
import { useCallback } from 'react';

import { useStyleSet } from '../../hooks/index';
import useCodeBlockCopyButtonTagName from '../CustomElements/useCodeBlockCopyButtonTagName';
import useHTMLContentTransformContext from './private/useHTMLContentTransformContext';

const { useLocalizer } = hooks;

export default function useTransformHTMLContent(): (documentFragment: DocumentFragment) => DocumentFragment {
  const [{ codeBlockCopyButton: codeBlockCopyButtonClassName }] = useStyleSet();
  const [codeBlockCopyButtonTagName] = useCodeBlockCopyButtonTagName();
  const { transform } = useHTMLContentTransformContext();

  const localize = useLocalizer();
  const codeBlockCopyButtonAltCopied = localize('COPY_BUTTON_TEXT');
  const codeBlockCopyButtonAltCopy = localize('COPY_BUTTON_COPIED_TEXT');
  const externalLinkAlt = localize('MARKDOWN_EXTERNAL_LINK_ALT');

  return useCallback(
    documentFragment =>
      transform({
        codeBlockCopyButtonAltCopied,
        codeBlockCopyButtonAltCopy,
        codeBlockCopyButtonClassName,
        codeBlockCopyButtonTagName,
        documentFragment,
        externalLinkAlt
      }),
    [
      codeBlockCopyButtonAltCopied,
      codeBlockCopyButtonAltCopy,
      codeBlockCopyButtonClassName,
      codeBlockCopyButtonTagName,
      externalLinkAlt,
      transform
    ]
  );
}
