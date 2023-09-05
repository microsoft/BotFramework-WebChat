import React, { type FC, memo } from 'react';

import TextContent from './TextContent';

import { type WebChatActivity } from 'botframework-webchat-core';
import { type WebChatAttachment } from '../private/types/WebChatAttachment';

type Props = {
  activity: WebChatActivity;
  attachment: WebChatAttachment & {
    contentType: `text/${string}`;
  };
};

const TextAttachment: FC<Props> = memo(({ activity, attachment: { content, contentType } }: Props) => (
  <TextContent contentType={contentType} entities={activity.entities} text={content} />
));

TextAttachment.displayName = 'TextAttachment';

export default TextAttachment;
