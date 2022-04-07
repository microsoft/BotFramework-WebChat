import type { DirectLineAttachment, WebChatActivity } from 'botframework-webchat-core';

// TODO: We should consider using a prop for "attachmentMiddleware" to render for screen reader, instead of having another middleware.

import ComponentMiddleware, { ComponentFactory } from './ComponentMiddleware';

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
