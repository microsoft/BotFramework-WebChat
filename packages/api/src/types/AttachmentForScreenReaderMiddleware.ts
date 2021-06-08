// TODO: We should consider using a prop for "attachmentMiddleware" to render as plain, instead of having another middleware.

import ComponentMiddleware, { ComponentFactory } from './ComponentMiddleware';
import DirectLineActivity from './external/DirectLineActivity';
import DirectLineAttachment from './external/DirectLineAttachment';

type AttachmentForScreenReaderComponentFactoryOptions = [
  {
    activity: DirectLineActivity;
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
