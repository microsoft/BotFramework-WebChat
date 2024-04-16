import { hooks } from 'botframework-webchat-component';
import cx from 'classnames';
import React, { memo, useCallback, useRef, useState, type FormEventHandler, type MouseEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';
import { SendIcon } from '../../icons/SendIcon';
import testIds from '../../testIds';
import DropZone from '../DropZone';
import SuggestedActions from '../SuggestedActions';
import { TelephoneKeypadSurrogate, useTelephoneKeypadShown, type DTMF } from '../TelephoneKeypad';
import AddAttachmentButton from './AddAttachmentButton';
import Attachments from './Attachments';
import ErrorMessage from './ErrorMessage';
import TelephoneKeypadToolbarButton from './TelephoneKeypadToolbarButton';
import TextArea from './TextArea';
import { Toolbar, ToolbarButton, ToolbarSeparator } from './Toolbar';
import useSubmitError from './private/useSubmitError';
import useUniqueId from './private/useUniqueId';
import styles from './index.module.css';
import { useStyles } from '../../styles';

const { useStyleOptions, useMakeThumbnail, useLocalizer, useSendBoxAttachments, useSendMessage } = hooks;

function SendBox(
  props: Readonly<{
    className?: string | undefined;
    placeholder?: string | undefined;
  }>
) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useSendBoxAttachments();
  const [{ hideTelephoneKeypadButton, hideUploadButton, maxMessageLength }] = useStyleOptions();
  const isMessageLengthExceeded = !!maxMessageLength && message.length > maxMessageLength;
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  const sendMessage = useSendMessage();
  const makeThumbnail = useMakeThumbnail();
  const errorMessageId = useUniqueId('sendbox__error-message-id');
  const [errorRef, errorMessage] = useSubmitError({ message, attachments });
  const [telephoneKeypadShown] = useTelephoneKeypadShown();

  const attachmentsRef = useRefFrom(attachments);
  const messageRef = useRefFrom(message);

  const handleSendBoxClick = useCallback<MouseEventHandler>(
    event => {
      if ('tabIndex' in event.target && typeof event.target.tabIndex === 'number' && event.target.tabIndex >= 0) {
        return;
      }

      // TODO: Should call `useFocus('sendBox')`.
      inputRef.current?.focus();
    },
    [inputRef]
  );

  const handleMessageChange: React.FormEventHandler<HTMLTextAreaElement> = useCallback(
    event => setMessage(event.currentTarget.value),
    [setMessage]
  );

  const handleAddFiles = useCallback(
    async (inputFiles: File[]) => {
      const newAttachments = Object.freeze(
        await Promise.all(
          inputFiles.map(file =>
            makeThumbnail(file).then(thumbnailURL =>
              Object.freeze({
                blob: file,
                ...(thumbnailURL && { thumbnailURL })
              })
            )
          )
        )
      );

      setAttachments(newAttachments);

      // TODO: Currently in the UX, we have no way to remove attachments.
      //       Keep concatenating doesn't make sense in current UX.
      //       When end-user can remove attachment, we should enable the code again.
      // setAttachments(attachments => attachments.concat(newAttachments));
    },
    [makeThumbnail, setAttachments]
  );

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    event => {
      event.preventDefault();

      if (errorRef.current !== 'empty' && !isMessageLengthExceeded) {
        sendMessage(messageRef.current, undefined, { attachments: attachmentsRef.current });

        setMessage('');
        setAttachments([]);
      }

      // TODO: Should call `useFocus('sendBox')`.
      inputRef.current?.focus();
    },
    [attachmentsRef, messageRef, sendMessage, setAttachments, setMessage, isMessageLengthExceeded, errorRef, inputRef]
  );

  const handleTelephoneKeypadButtonClick = useCallback(
    // TODO: We need more official way of sending DTMF.
    (dtmf: DTMF) => sendMessage(`/DTMF ${dtmf}`),
    [sendMessage]
  );

  const aria = {
    'aria-invalid': 'false' as const,
    ...(errorMessage && {
      'aria-invalid': 'true' as const,
      'aria-errormessage': errorMessageId
    })
  };

  return (
    <form {...aria} className={cx(classNames['sendbox'], props.className)} onSubmit={handleFormSubmit}>
      <SuggestedActions />
      <div className={cx(classNames['sendbox__sendbox'])} onClickCapture={handleSendBoxClick}>
        <TelephoneKeypadSurrogate
          autoFocus={true}
          isHorizontal={false}
          onButtonClick={handleTelephoneKeypadButtonClick}
        />
        <TextArea
          aria-label={isMessageLengthExceeded ? localize('TEXT_INPUT_LENGTH_EXCEEDED_ALT') : localize('TEXT_INPUT_ALT')}
          className={classNames['sendbox__sendbox-text']}
          data-testid={testIds.sendBoxTextBox}
          hidden={telephoneKeypadShown}
          onInput={handleMessageChange}
          placeholder={props.placeholder ?? localize('TEXT_INPUT_PLACEHOLDER')}
          ref={inputRef}
          value={message}
        />
        <Attachments attachments={attachments} />
        <div className={cx(classNames['sendbox__sendbox-controls'])}>
          {maxMessageLength && (
            <div
              className={cx(classNames['sendbox__text-counter'], {
                [classNames['sendbox__text-counter--error']]: isMessageLengthExceeded
              })}
            >
              {`${message.length}/${maxMessageLength}`}
            </div>
          )}
          <Toolbar>
            {!hideTelephoneKeypadButton && <TelephoneKeypadToolbarButton />}
            {!hideUploadButton && <AddAttachmentButton onFilesAdded={handleAddFiles} />}
            <ToolbarSeparator />
            <ToolbarButton
              aria-label={localize('TEXT_INPUT_SEND_BUTTON_ALT')}
              data-testid={testIds.sendBoxSendButton}
              disabled={isMessageLengthExceeded}
              type="submit"
            >
              <SendIcon />
            </ToolbarButton>
          </Toolbar>
        </div>
        <DropZone onFilesAdded={handleAddFiles} />
        <ErrorMessage error={errorMessage} id={errorMessageId} />
      </div>
    </form>
  );
}

export default memo(SendBox);
