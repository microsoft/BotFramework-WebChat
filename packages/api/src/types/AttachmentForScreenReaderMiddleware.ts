import { type DirectLineAttachment, type WebChatActivity } from 'botframework-webchat-core';

// TODO: We should consider using a prop for "attachmentMiddleware" to render for screen reader, instead of having another middleware.

import ComponentMiddleware, { ComponentFactory } from './ComponentMiddleware';

type AttachmentForScreenReaderComponentFactoryOptions = [
  {
    activity: WebChatActivity;
    attachment: DirectLineAttachment;
  }
];

type AttachmentForScreenReaderComponentFactory = ComponentFactory<
  AttachmentForScreenReaderComponentFactoryOptions,
  // Following @types/react to use {} for props.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {}
>;

type AttachmentForScreenReaderMiddleware = ComponentMiddleware<
  [],
  AttachmentForScreenReaderComponentFactoryOptions,
  // Following @types/react to use {} for props.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {}
>;

export default AttachmentForScreenReaderMiddleware;

export type { AttachmentForScreenReaderComponentFactory };
