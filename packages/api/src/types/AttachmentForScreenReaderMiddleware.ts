import { type DirectLineAttachment, type WebChatActivity } from 'botframework-webchat-core';

// TODO: We should consider using a prop for "attachmentMiddleware" to render for screen reader, instead of having another middleware.

import { type ComponentFactory } from './ComponentMiddleware';
import type ComponentMiddleware from './ComponentMiddleware';

type AttachmentForScreenReaderComponentFactoryOptions = [
  {
    activity: WebChatActivity;
    attachment: DirectLineAttachment;
  }
];

type AttachmentForScreenReaderComponentFactory = ComponentFactory<AttachmentForScreenReaderComponentFactoryOptions, {}>;

type AttachmentForScreenReaderMiddleware = ComponentMiddleware<
  [],
  AttachmentForScreenReaderComponentFactoryOptions,
  {}
>;

export default AttachmentForScreenReaderMiddleware;

export type { AttachmentForScreenReaderComponentFactory };
