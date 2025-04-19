import { type SendBoxAttachment } from 'botframework-webchat-core';
import React, { memo } from 'react';

type ImageAttachmentPreviewProps = Readonly<{
  attachment: SendBoxAttachment & {
    thumbnailURL: URL;
  };
}>;

const ImageAttachmentPreview = ({ attachment }: ImageAttachmentPreviewProps) => {
  // TODO: Localize this.
  const name = attachment.blob instanceof File ? attachment.blob.name : 'An image';

  return (
    <img
      alt={name}
      className="webchat__send-box-attachment__preview webchat__send-box-attachment__preview--is-image"
      src={attachment.thumbnailURL.href}
    />
  );
};

ImageAttachmentPreview.displayName = 'ImageAttachment';

export default memo(ImageAttachmentPreview);
export { type ImageAttachmentPreviewProps };
