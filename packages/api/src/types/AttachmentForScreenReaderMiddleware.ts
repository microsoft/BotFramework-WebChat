// // TODO: We should consider using a prop for "attachmentMiddleware" to render as plain, instead of having another middleware.

// import { ReactNode } from 'react';

// import DirectLineActivity from './external/DirectLineActivity';
// import DirectLineAttachment from './external/DirectLineAttachment';

// type AttachmentForScreenReaderComponent = () => Exclude<ReactNode, false>;

// type AttachmentForScreenReaderComponentFactoryOptions = {
//   activity: DirectLineActivity;
//   attachment: DirectLineAttachment;
// };

// type AttachmentForScreenReaderComponentFactory = (
//   options: AttachmentForScreenReaderComponentFactoryOptions
// ) => AttachmentForScreenReaderComponent | false;

// type AttachmentForScreenReaderEnhancer = (
//   next: AttachmentForScreenReaderComponentFactory
// ) => AttachmentForScreenReaderComponentFactory;

// type AttachmentForScreenReaderMiddleware = () => AttachmentForScreenReaderEnhancer;

// export default AttachmentForScreenReaderMiddleware;

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

export type AttachmentForScreenReaderComponentFactory = ComponentFactory<
  AttachmentForScreenReaderComponentFactoryOptions,
  {}
>;

type AttachmentForScreenReaderMiddleware = ComponentMiddleware<
  [],
  AttachmentForScreenReaderComponentFactoryOptions,
  {}
>;

export default AttachmentForScreenReaderMiddleware;
