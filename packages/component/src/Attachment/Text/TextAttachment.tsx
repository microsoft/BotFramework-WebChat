import React, { type FC, memo } from 'react';

import TextContent from './TextContent';

import { type WebChatAttachment } from '../private/types/WebChatAttachment';

type Props = {
  attachment: WebChatAttachment & {
    contentType: `text/${string}`;
  };
};

const TextAttachment: FC<Props> = memo(({ attachment: { content, contentType } }: Props) => (
  <TextContent contentType={contentType} text={content} />
));

TextAttachment.displayName = 'TextAttachment';

export default TextAttachment;
