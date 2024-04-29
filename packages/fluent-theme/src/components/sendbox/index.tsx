import { hooks, type SendBoxFocusOptions } from 'botframework-webchat-component';
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

const {
  useFocus,
  useLocalizer,
  useMakeThumbnail,
  useRegisterFocusSendBox,
  useSendBoxAttachments,
  useSendMessage,
  useStyleOptions
} = hooks;

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
  const setFocus = useFocus();

  useRegisterFocusSendBox(
    useCallback(
      ({ noKeyboard, waitUntil }: SendBoxFocusOptions) => {
        if (!inputRef.current) {
          return;
        }
        if (noKeyboard) {
          waitUntil(
            (async () => {
              const previousReadOnly = inputRef.current?.getAttribute('readonly');
              inputRef.current?.setAttribute('readonly', 'true');
              // TODO: [P2] We should update this logic to handle quickly-successive `focusCallback`.
              //       If a succeeding `focusCallback` is being called, the `setTimeout` should run immediately.
              //       Or the second `focusCallback` should not set `readonly` to `true`.
              // eslint-disable-next-line no-restricted-globals
              await new Promise(resolve => setTimeout(resolve, 0));
              inputRef.current?.focus();
              if (typeof previousReadOnly !== 'string') {
                inputRef.current?.removeAttribute('readonly');
              } else {
                inputRef.current?.setAttribute('readonly', previousReadOnly); 
              }
            })()
          );
        } else {
          inputRef.current?.focus();
        }
      },
      [inputRef]
    )
  );

  const attachmentsRef = useRefFrom(attachments);
  const messageRef = useRefFrom(message);

  const handleSendBoxClick = useCallback<MouseEventHandler>(
    event => {
      if ('tabIndex' in event.target && typeof event.target.tabIndex === 'number' && event.target.tabIndex >= 0) {
        return;
      }

      setFocus('sendBox');
    },
    [setFocus]
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

      setFocus('sendBox');
    },
    [attachmentsRef, messageRef, sendMessage, setAttachments, setMessage, isMessageLengthExceeded, errorRef, setFocus]
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
        <TextArea
          aria-label={isMessageLengthExceeded ? localize('TEXT_INPUT_LENGTH_EXCEEDED_ALT') : localize('TEXT_INPUT_ALT')}
          className={cx(classNames['sendbox__sendbox-text'], classNames['sendbox__text-area--in-grid'])}
          data-testid={testIds.sendBoxTextBox}
          hidden={telephoneKeypadShown}
          onInput={handleMessageChange}
          placeholder={props.placeholder ?? localize('TEXT_INPUT_PLACEHOLDER')}
          ref={inputRef}
          value={message}
        />
        <TelephoneKeypadSurrogate
          autoFocus={true}
          className={classNames['sendbox__telephone-keypad--in-grid']}
          isHorizontal={false}
          onButtonClick={handleTelephoneKeypadButtonClick}
        />
        <Attachments attachments={attachments} className={classNames['sendbox__attachment--in-grid']} />
        <div className={cx(classNames['sendbox__sendbox-controls'], classNames['sendbox__sendbox-controls--in-grid'])}>
          {!telephoneKeypadShown && maxMessageLength && (
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
              disabled={isMessageLengthExceeded || telephoneKeypadShown}
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
