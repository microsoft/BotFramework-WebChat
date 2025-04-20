import React, { KeyboardEventHandler, useCallback } from 'react';

import { useFocus } from '../../hooks';

type AttachmentDeleteButton = Readonly<{
  onClick?: (() => void) | undefined;
}>;

const AttachmentDeleteButton = ({ onClick }: AttachmentDeleteButton) => {
  const focus = useFocus();

  // TODO: Localize.
  const altText = 'Delete attachment';

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
      aria-label={altText}
      className="webchat__send-box-attachment-bar-item__delete-button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      type="button"
    >
      {/* TODO: The SVG seems 1-pixel shifted to left. */}
      {/* <svg height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.58859 2.71569L2.64645 2.64645C2.82001 2.47288 3.08944 2.4536 3.28431 2.58859L3.35355 2.64645L8 7.293L12.6464 2.64645C12.8417 2.45118 13.1583 2.45118 13.3536 2.64645C13.5488 2.84171 13.5488 3.15829 13.3536 3.35355L8.707 8L13.3536 12.6464C13.5271 12.82 13.5464 13.0894 13.4114 13.2843L13.3536 13.3536C13.18 13.5271 12.9106 13.5464 12.7157 13.4114L12.6464 13.3536L8 8.707L3.35355 13.3536C3.15829 13.5488 2.84171 13.5488 2.64645 13.3536C2.45118 13.1583 2.45118 12.8417 2.64645 12.6464L7.293 8L2.64645 3.35355C2.47288 3.17999 2.4536 2.91056 2.58859 2.71569L2.64645 2.64645L2.58859 2.71569Z" />
      </svg> */}
      <svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6.08859 6.21569L6.14645 6.14645C6.32001 5.97288 6.58944 5.9536 6.78431 6.08859L6.85355 6.14645L10 9.293L13.1464 6.14645C13.3417 5.95118 13.6583 5.95118 13.8536 6.14645C14.0488 6.34171 14.0488 6.65829 13.8536 6.85355L10.707 10L13.8536 13.1464C14.0271 13.32 14.0464 13.5894 13.9114 13.7843L13.8536 13.8536C13.68 14.0271 13.4106 14.0464 13.2157 13.9114L13.1464 13.8536L10 10.707L6.85355 13.8536C6.65829 14.0488 6.34171 14.0488 6.14645 13.8536C5.95118 13.6583 5.95118 13.3417 6.14645 13.1464L9.293 10L6.14645 6.85355C5.97288 6.67999 5.9536 6.41056 6.08859 6.21569L6.14645 6.14645L6.08859 6.21569Z"
          fill="#242424"
        />
      </svg>
    </button>
  );
};

AttachmentDeleteButton.displayName = 'SendBoxAttachmentItemDeleteButton';

export default AttachmentDeleteButton;
export { type AttachmentDeleteButton };
