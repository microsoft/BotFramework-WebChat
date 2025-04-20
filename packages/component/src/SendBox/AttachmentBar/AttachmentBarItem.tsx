import { type SendBoxAttachment } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo, useCallback } from 'react';
import { useRefFrom } from 'use-ref-from';

import { useStyleSet } from '../../hooks';
import testIds from '../../testIds';
import DeleteButton from './ItemDeleteButton';
import Preview from './ItemPreview';

type AttachmentBarItemProps = Readonly<{
  attachment: SendBoxAttachment;
  mode: 'text only' | 'thumbnail';
  onDelete?: ((event: Readonly<{ attachment: SendBoxAttachment }>) => void) | undefined;
}>;

const AttachmentBarItem = ({ attachment, mode, onDelete }: AttachmentBarItemProps) => {
  const [{ sendBoxAttachmentBarItem: sendBoxAttachmentBarItemClassName }] = useStyleSet();
  const attachmentRef = useRefFrom(attachment);
  const onDeleteRef = useRefFrom(onDelete);

  const handleDeleteButtonClick = useCallback(
    () => onDeleteRef.current?.({ attachment: attachmentRef.current }),
    [attachmentRef, onDeleteRef]
  );

  return (
    <div
      className={classNames(sendBoxAttachmentBarItemClassName, 'webchat__send-box-attachment-bar-item', {
        'webchat__send-box-attachment-bar-item--text-only': mode === 'text only',
        'webchat__send-box-attachment-bar-item--thumbnail': mode === 'thumbnail'
      })}
      data-testid={testIds.sendBoxAttachmentBarItem}
    >
      <Preview attachment={attachment} mode={mode} />
      <DeleteButton onClick={handleDeleteButtonClick} />
    </div>
  );
};

AttachmentBarItem.displayName = 'SendBoxAttachmentBarItem';

export default memo(AttachmentBarItem);
export { type AttachmentBarItemProps };
