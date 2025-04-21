import { hooks } from 'botframework-webchat-api';
import React, { KeyboardEventHandler, useCallback } from 'react';
import { useFocus } from '../../hooks';
import testIds from '../../testIds';
import DeleteIcon from './DeleteIcon';

const { useLocalizer } = hooks;

type AttachmentDeleteButton = Readonly<{
  attachmentName: string;
  onClick?: (() => void) | undefined;
  size?: 'large' | 'small' | undefined;
}>;

const AttachmentDeleteButton = ({ attachmentName, onClick, size }: AttachmentDeleteButton) => {
  const focus = useFocus();
  const localize = useLocalizer();

  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLButtonElement>>(
    event => {
      if (event.key === 'Escape') {
        event.preventDefault();

        focus('sendBox');
      }
    },
    [focus]
  );

  return (
    <button
      aria-label={localize('SEND_BOX_ATTACHMENT_BAR_DELETE_BUTTON_ALT', attachmentName)}
      className="webchat__send-box-attachment-bar-item__delete-button"
      data-testid={testIds.sendBoxAttachmentBarItemDeleteButton}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      title={localize('SEND_BOX_ATTACHMENT_BAR_DELETE_BUTTON_TOOLTIP')}
      type="button"
    >
      <DeleteIcon size={size} />
    </button>
  );
};

AttachmentDeleteButton.displayName = 'SendBoxAttachmentItemDeleteButton';

export default AttachmentDeleteButton;
export { type AttachmentDeleteButton };
