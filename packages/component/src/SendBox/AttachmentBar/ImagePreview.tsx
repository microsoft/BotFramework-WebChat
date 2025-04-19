import { type SendBoxAttachment } from 'botframework-webchat-core';
import React, { memo } from 'react';

type ImageAttachmentPreviewProps = Readonly<{
  attachment: SendBoxAttachment & {
    thumbnailURL: URL;
  };
  mode: 'text only' | 'thumbnail';
}>;

const ImageAttachmentPreview = ({ attachment, mode }: ImageAttachmentPreviewProps) => {
  // TODO: Localize this.
  const name = attachment.blob instanceof File ? attachment.blob.name : 'An image';

  return mode === 'text only' ? (
    <div>{name}</div>
  ) : (
    <img
      className="webchat__send-box-attachment-bar-item__preview webchat__send-box-attachment-bar-item__preview--is-image"
      src={attachment.thumbnailURL.href}
      title={name}
    />
  );
};

ImageAttachmentPreview.displayName = 'SendBoxAttachmentBarItemImageAttachmentPreview';

export default memo(ImageAttachmentPreview);
export { type ImageAttachmentPreviewProps };
