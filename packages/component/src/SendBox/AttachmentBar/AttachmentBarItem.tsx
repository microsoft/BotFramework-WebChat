import { type SendBoxAttachment } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { useRefFrom } from 'use-ref-from';

import { useFocus, useStyleSet } from '../../hooks';
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
  const elementRef = useRef<HTMLDivElement>(null);
  const focus = useFocus();
  const onDeleteRef = useRefFrom(onDelete);
  const shownRef = useRef<boolean>(false);

  const handleDeleteButtonClick = useCallback(() => {
    onDeleteRef.current?.({ attachment: attachmentRef.current });

    // After delete, focus back to the send box.
    focus('sendBox');
  }, [attachmentRef, focus, onDeleteRef]);

  // If the item is newly added, scroll it into view.
  useEffect(() => {
    if (!shownRef.current) {
      shownRef.current = true;

      elementRef.current?.scrollIntoView();
    }
  }, [elementRef, shownRef]);

  return (
    <div
      className={classNames(sendBoxAttachmentBarItemClassName, 'webchat__send-box-attachment-bar-item', {
        'webchat__send-box-attachment-bar-item--text-only': mode === 'text only',
        'webchat__send-box-attachment-bar-item--thumbnail': mode === 'thumbnail'
      })}
      data-testid={testIds.sendBoxAttachmentBarItem}
      ref={elementRef}
    >
      <Preview attachment={attachment} mode={mode} />
      <DeleteButton onClick={handleDeleteButtonClick} size={mode === 'text only' ? 'small' : 'large'} />
    </div>
  );
};

AttachmentBarItem.displayName = 'SendBoxAttachmentBarItem';

export default memo(AttachmentBarItem);
export { type AttachmentBarItemProps };
