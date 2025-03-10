import { WebChatActivity } from 'botframework-webchat-core';

import { type TypeOfArray } from '../../../types/internal/TypeOfArray';

export type WebChatAttachment = TypeOfArray<
  Exclude<(WebChatActivity & { type: 'message' })['attachments'], undefined>
> & {
  content?: string;
  contentType: string;
};
