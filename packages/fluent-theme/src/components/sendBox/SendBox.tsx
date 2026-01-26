import { hooks } from 'botframework-webchat-component';
import cx from 'classnames';
import React, {
  memo,
  ReactNode,
  useCallback,
  useRef,
  useState,
  type FormEventHandler,
  type MouseEventHandler
} from 'react';
import { useRefFrom } from 'use-ref-from';
import { SendIcon } from '../../icons';
import { useStyles, useVariantClassName } from '../../styles';
import testIds from '../../testIds';
import { DropZone } from '../dropZone';
import { SuggestedActions } from '../suggestedActions';
import { TelephoneKeypadSurrogate, useTelephoneKeypadShown, type DTMF } from '../telephoneKeypad';
import AddAttachmentButton from './AddAttachmentButton';
import Attachments from './Attachments';
import ErrorMessage from './ErrorMessage';
import useSubmitError from './private/useSubmitError';
import useTranscriptNavigation from './private/useTranscriptNavigation';
import useUniqueId from './private/useUniqueId';
import styles from './SendBox.module.css';
import TelephoneKeypadToolbarButton from './TelephoneKeypadToolbarButton';
import TextArea from './TextArea';
import { Toolbar, ToolbarButton, ToolbarSeparator } from './Toolbar';

const {
  useFocus,
  useLocalizer,
  useMakeThumbnail,
  useRegisterFocusSendBox,
  useSendBoxAttachments,
  useSendBoxValue,
  useSendMessage,
  useStyleOptions,
  useUIState
} = hooks;

type Props = Readonly<{
  className?: string | undefined;
  completion?: ReactNode | undefined;
  isPrimary?: boolean | undefined;
  placeholder?: string | undefined;
}>;

function SendBox(props: Props) {
  const [{ hideTelephoneKeypadButton, hideUploadButton, maxMessageLength }] = useStyleOptions();
  const [attachments, setAttachments] = useSendBoxAttachments();
  const [globalMessage, setGlobalMessage] = useSendBoxValue();
  const [localMessage, setLocalMessage] = useState('');
  const [telephoneKeypadShown] = useTelephoneKeypadShown();
  const [uiState] = useUIState();
  const classNames = useStyles(styles);
  const variantClassName = useVariantClassName(styles);
  const errorMessageId = useUniqueId('sendbox__error-message-id');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const localize = useLocalizer();
  const makeThumbnail = useMakeThumbnail();
  const sendMessage = useSendMessage();
  const setFocus = useFocus();

  const message = props.isPrimary ? globalMessage : localMessage;
  const setMessage = props.isPrimary ? setGlobalMessage : setLocalMessage;
  const isBlueprint = uiState === 'blueprint';

  const [errorMessage, commitLatestError] = useSubmitError({ message, attachments });
  const isMessageLengthExceeded = !!maxMessageLength && message.length > maxMessageLength;
  const shouldShowMessageLength =
    !isBlueprint && !telephoneKeypadShown && maxMessageLength && isFinite(maxMessageLength);
  const shouldShowTelephoneKeypad = !isBlueprint && telephoneKeypadShown;

  useRegisterFocusSendBox(
    useCallback(
      ({ noKeyboard }) => {
        const { current } = inputRef;

        // Setting `inputMode` to `none` temporarily to suppress soft keyboard in iOS.
        // We will revert the change once the end-user tap on the send box.
        // This code path is only triggered when the user press "send" button to send the message, instead of pressing ENTER key.
        noKeyboard && current?.setAttribute('inputmode', 'none');
        current?.focus();
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

  const handleClick = useCallback(({ currentTarget }) => currentTarget.removeAttribute('inputmode'), []);

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    event => {
      event.preventDefault();
      const error = commitLatestError();

      if (error !== 'empty' && !isMessageLengthExceeded) {
        sendMessage(messageRef.current, undefined, { attachments: attachmentsRef.current });

        setMessage('');
        setAttachments([]);
      }

      setFocus('sendBox');
    },
    [
      commitLatestError,
      isMessageLengthExceeded,
      setFocus,
      sendMessage,
      setMessage,
      messageRef,
      attachmentsRef,
      setAttachments
    ]
  );

  const handleTelephoneKeypadButtonClick = useCallback(
    // TODO: We need more official way of sending DTMF.
    (dtmf: DTMF) => sendMessage(`/DTMFKey ${dtmf}`),
    [sendMessage]
  );

  const handleTranscriptNavigation = useTranscriptNavigation();

  const aria = {
    'aria-invalid': 'false' as const,
    ...(errorMessage && {
      'aria-describedby': errorMessageId,
      'aria-errormessage': errorMessageId,
      'aria-invalid': 'true' as const
    })
  };

  return (
    <form
      {...aria}
      className={cx(classNames['sendbox'], variantClassName, props.className)}
      data-testid={testIds.sendBoxContainer}
      onSubmit={handleFormSubmit}
    >
      <SuggestedActions />
      <div
        className={cx(classNames['sendbox__sendbox'])}
        onClickCapture={handleSendBoxClick}
        onKeyDown={handleTranscriptNavigation}
      >
        <TextArea
          aria-label={isMessageLengthExceeded ? localize('TEXT_INPUT_LENGTH_EXCEEDED_ALT') : localize('TEXT_INPUT_ALT')}
          className={cx(classNames['sendbox__sendbox-text'], classNames['sendbox__text-area--in-grid'])}
          completion={props.completion}
          data-testid={testIds.sendBoxTextBox}
          hidden={shouldShowTelephoneKeypad}
          onClick={handleClick}
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
          {shouldShowMessageLength && (
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
              disabled={isMessageLengthExceeded || shouldShowTelephoneKeypad}
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

const PrimarySendBox = memo((props: Exclude<Props, 'primary'>) => <SendBox {...props} isPrimary={true} />);

PrimarySendBox.displayName = 'PrimarySendBox';

export default memo(SendBox);

export { PrimarySendBox };
