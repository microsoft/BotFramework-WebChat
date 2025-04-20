import { type SendBoxAttachment } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo } from 'react';
import { useStyleSet } from '../../../hooks';
import FilePreview from './FilePreview';

type ImageAttachmentPreviewProps = Readonly<{
  attachment: SendBoxAttachment & {
    thumbnailURL: URL;
  };
  mode: 'text only' | 'thumbnail';
}>;

const ImageAttachmentPreview = ({ attachment, mode }: ImageAttachmentPreviewProps) => {
  const [{ sendBoxAttachmentBarItemImagePreview: sendBoxAttachmentBarItemImagePreviewClassName }] = useStyleSet();
  const name = attachment.blob instanceof File ? attachment.blob.name : 'An image';

  return mode === 'text only' ? (
    <FilePreview attachment={attachment} mode={mode} />
  ) : (
    <img
      className={classNames(
        sendBoxAttachmentBarItemImagePreviewClassName,
        'webchat__send-box-attachment-bar-item-image-preview'
      )}
      src={attachment.thumbnailURL.href}
      title={name}
    />
  );
};

ImageAttachmentPreview.displayName = 'SendBoxAttachmentBarItemImageAttachmentPreview';

export default memo(ImageAttachmentPreview);
export { type ImageAttachmentPreviewProps };
