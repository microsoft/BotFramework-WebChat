import React, { type FC, memo } from 'react';

import MarkdownTextContent from './private/MarkdownTextContent';
import PlainTextContent from './private/PlainTextContent';
import useRenderMarkdownAsHTML from '../../hooks/useRenderMarkdownAsHTML';

import { type WebChatActivity } from 'botframework-webchat-core';

type Props = Readonly<{
  contentType?: string;
  entities?: WebChatActivity['entities'];
  text: string;
}>;

const TextContent: FC<Props> = memo(({ contentType = 'text/plain', entities, text }: Props) => {
  const supportMarkdown = !!useRenderMarkdownAsHTML();

  return text ? (
    contentType === 'text/markdown' && supportMarkdown ? (
      <MarkdownTextContent entities={entities} markdown={text} />
    ) : (
      <PlainTextContent text={text} />
    )
  ) : null;
});

TextContent.defaultProps = { contentType: 'text/plain' };
TextContent.displayName = 'TextContent';

export default TextContent;
