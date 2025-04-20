import { type SendBoxAttachment } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo } from 'react';
import { useStyleSet } from '../../../hooks';
import FileIcon from './FileIcon';
import ImageIcon from './ImageIcon';

type FileAttachmentPreviewProps = Readonly<{
  attachment: SendBoxAttachment;
  mode: 'text only' | 'thumbnail';
}>;

const FileAttachmentPreview = ({ attachment, mode }: FileAttachmentPreviewProps) => {
  const [{ sendBoxAttachmentBarItemFilePreview: sendBoxAttachmentBarItemFilePreviewClassName }] = useStyleSet();
  // TODO: Localize this.
  const name = attachment.blob instanceof File ? attachment.blob.name : 'A file';

  return mode === 'text only' ? (
    <div
      className={classNames(
        sendBoxAttachmentBarItemFilePreviewClassName,
        'webchat__send-box-attachment-bar-item-file-preview',
        'webchat__send-box-attachment-bar-item-file-preview--text-only'
      )}
    >
      {attachment.thumbnailURL ? <ImageIcon /> : <FileIcon />}
      <div className="webchat__send-box-attachment-bar-item-file-preview__text">{name}</div>
    </div>
  ) : (
    <div
      className={classNames(
        sendBoxAttachmentBarItemFilePreviewClassName,
        'webchat__send-box-attachment-bar-item-file-preview',
        'webchat__send-box-attachment-bar-item-file-preview--thumbnail'
      )}
      title={name}
    >
      <FileIcon size="large" />
    </div>
  );
};

FileAttachmentPreview.displayName = 'SendBoxAttachmentBarItemFileAttachmentPreview';

export default memo(FileAttachmentPreview);
export { type FileAttachmentPreviewProps };
