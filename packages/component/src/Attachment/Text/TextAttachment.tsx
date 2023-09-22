import { type WebChatActivity } from 'botframework-webchat-core';
import React, { type FC, memo } from 'react';

import { type WebChatAttachment } from '../private/types/WebChatAttachment';
import TextContent from './TextContent';

type Props = Readonly<{
  activity: WebChatActivity;
  attachment: WebChatAttachment & {
    contentType: `text/${string}`;
  };
}>;

const TextAttachment: FC<Props> = memo(({ activity, attachment: { content, contentType } }: Props) => (
  <TextContent contentType={contentType} entities={activity.entities} text={content} />
));

TextAttachment.displayName = 'TextAttachment';

export default TextAttachment;
