import { hooks } from 'botframework-webchat-api';
import React, { KeyboardEventHandler, useCallback } from 'react';
import { useFocus } from '../../hooks';
import testIds from '../../testIds';
import DeleteIcon from './DeleteIcon';

const { useLocalizer } = hooks;

type AttachmentDeleteButton = Readonly<{
  onClick?: (() => void) | undefined;
  size?: 'large' | 'small' | undefined;
}>;

const AttachmentDeleteButton = ({ onClick, size }: AttachmentDeleteButton) => {
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
      className="webchat__send-box-attachment-bar-item__delete-button"
      data-testid={testIds.sendBoxAttachmentBarItemDeleteButton}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      title={localize('SEND_BOX_ATTACHMENT_BAR_DELETE_BUTTON')}
      type="button"
    >
      <DeleteIcon size={size} />
    </button>
  );
};

AttachmentDeleteButton.displayName = 'SendBoxAttachmentItemDeleteButton';

export default AttachmentDeleteButton;
export { type AttachmentDeleteButton };
