import { type SendBoxAttachment } from 'botframework-webchat-core';
import React, { memo } from 'react';

type BlobAttachmentPreviewProps = Readonly<{
  attachment: SendBoxAttachment & { blob: Blob };
}>;

const BlobAttachmentPreview = ({ attachment }: BlobAttachmentPreviewProps) => {
  // TODO: Localize this.
  const name = attachment.blob instanceof File ? attachment.blob.name : 'An file';

  return (
    <div className="webchat__send-box-attachment__preview webchat__send-box-attachment__preview--is-blob">{name}</div>
  );
};

BlobAttachmentPreview.displayName = 'BlobAttachmentPreview';

export default memo(BlobAttachmentPreview);
export { type BlobAttachmentPreviewProps };
