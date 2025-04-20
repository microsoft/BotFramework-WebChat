import { type SendBoxAttachment } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo, useMemo } from 'react';
import FileIcon from './FileIcon';
import ImageIcon from './ImageIcon';

type FileAttachmentPreviewProps = Readonly<{
  attachment: SendBoxAttachment;
  mode: 'text only' | 'thumbnail';
}>;

const FileAttachmentPreview = ({ attachment, mode }: FileAttachmentPreviewProps) => {
  // TODO: Localize this.
  const name = attachment.blob instanceof File ? attachment.blob.name : 'A file';
  const className = useMemo(
    () =>
      classNames('webchat__send-box-attachment-bar-item-file-preview', {
        'webchat__send-box-attachment-bar-item-file-preview--text-only': mode === 'text only',
        'webchat__send-box-attachment-bar-item-file-preview--thumbnail': mode === 'thumbnail'
      }),
    [mode]
  );

  return mode === 'text only' ? (
    <div className={className}>
      {attachment.thumbnailURL ? <ImageIcon /> : <FileIcon />}
      <div className="webchat__send-box-attachment-bar-item-file-preview__text">{name}</div>
    </div>
  ) : (
    <div className={className} title={name}>
      <FileIcon size="large" />
    </div>
  );
};

FileAttachmentPreview.displayName = 'SendBoxAttachmentBarItemFileAttachmentPreview';

export default memo(FileAttachmentPreview);
export { type FileAttachmentPreviewProps };
