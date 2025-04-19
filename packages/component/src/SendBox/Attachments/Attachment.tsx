import { type SendBoxAttachment } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo, useCallback } from 'react';
import { useRefFrom } from 'use-ref-from';

import { useStyleSet } from '../../hooks';
import AttachmentDeleteButton from './AttachmentDeleteButton';
import AttachmentPreview from './AttachmentPreview';

type AttachmentProps = Readonly<{
  attachment: SendBoxAttachment;
  onDelete?: ((event: Readonly<{ attachment: SendBoxAttachment }>) => void) | undefined;
}>;

const Attachment = ({ attachment, onDelete }: AttachmentProps) => {
  const [{ sendBoxAttachment: sendBoxAttachmentClassName }] = useStyleSet();
  const attachmentRef = useRefFrom(attachment);
  const onDeleteRef = useRefFrom(onDelete);

  const handleDeleteButtonClick = useCallback(
    () => onDeleteRef.current?.({ attachment: attachmentRef.current }),
    [attachmentRef, onDeleteRef]
  );

  return (
    <div className={classNames(sendBoxAttachmentClassName, 'webchat__send-box-attachment')}>
      <AttachmentPreview attachment={attachment} />
      <AttachmentDeleteButton onClick={handleDeleteButtonClick} />
    </div>
  );
};

Attachment.displayName = 'Attachment';

export default memo(Attachment);
export { type AttachmentProps };
