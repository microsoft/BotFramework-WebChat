import { isValidElement } from 'react';

import useCreateAttachmentRenderer from './useCreateAttachmentRenderer';

let showDeprecationNotes = true;

export default function useRenderAttachment() {
  if (showDeprecationNotes) {
    console.warn(
      'botframework-webchat: "useRenderAttachment" is deprecated and will be removed on or after 2022-09-28. Please use "useCreateAttachmentRenderer()" instead.'
    );

    showDeprecationNotes = false;
  }

  const createAttachmentRenderer = useCreateAttachmentRenderer();

  return (...renderArgs) => {
    const result = createAttachmentRenderer(...renderArgs);

    return !!result && isValidElement(result) ? result : result();
  };
}
