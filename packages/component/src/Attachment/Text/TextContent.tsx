import React, { type FC, memo } from 'react';

import MarkdownTextContent from './MarkdownTextContent';
import PlainTextContent from './PlainTextContent';
import useRenderMarkdownAsHTML from '../../hooks/useRenderMarkdownAsHTML';

type Props = {
  contentType?: string;
  text: string;
};

const TextContent: FC<Props> = memo(({ contentType = 'text/plain', text }: Props) => {
  const supportMarkdown = !!useRenderMarkdownAsHTML();

  return text ? (
    contentType === 'text/markdown' && supportMarkdown ? (
      <MarkdownTextContent markdown={text} />
    ) : (
      <PlainTextContent text={text} />
    )
  ) : null;
});

TextContent.defaultProps = { contentType: 'text/plain' };
TextContent.displayName = 'TextContent';

export default TextContent;
