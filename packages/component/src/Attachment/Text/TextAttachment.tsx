import { type WebChatActivity } from 'botframework-webchat-core';
import React, { type ReactNode, memo } from 'react';

import { type WebChatAttachment } from '../private/types/WebChatAttachment';
import TextContent from './TextContent';

type Props = Readonly<{
  activity: WebChatActivity;
  attachment: WebChatAttachment & {
    contentType: `text/${string}`;
  };
}>;

const TextAttachment = memo(
  ({ activity, attachment: { content, contentType } }: Props): ReactNode => (
    <TextContent contentType={contentType} entities={activity.entities} text={content} />
  )
);

TextAttachment.displayName = 'TextAttachment';

export default TextAttachment;
