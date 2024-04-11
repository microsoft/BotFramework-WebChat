import { hooks } from 'botframework-webchat-component';
import cx from 'classnames';
import React, { memo, useCallback, useRef, useState, type FormEventHandler, type MouseEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';
import { SendIcon } from '../../icons/SendIcon';
import { useStyles } from '../../styles';
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

const { useStyleOptions, useMakeThumbnail, useLocalizer, useSendBoxAttachments, useSendMessage } = hooks;

const styles = {
  'webchat-fluent__sendbox': {
    color: 'var(--webchat-colorNeutralForeground1)',
    fontFamily: 'var(--webchat-fontFamilyBase)',
    padding: '0 10px 10px',
    textRendering: 'optimizeLegibility'
  },

  'webchat-fluent__sendbox__sendbox': {
    backgroundColor: 'var(--webchat-colorNeutralBackground1)',
    border: '1px solid var(--webchat-colorNeutralStroke1)',
    borderRadius: 'var(--webchat-borderRadiusLarge)',
    display: 'grid',
    fontFamily: 'var(--webchat-fontFamilyBase)',
    fontSize: '14px',
    gap: '6px',
    lineHeight: '20px',
    padding: '8px',
    position: 'relative',

    '&:focus-within': {
      borderColor: 'var(--webchat-colorNeutralStroke1Selected)',
      // TODO clarify with design the color:
      // - Teams is using colorCompoundBrandForeground1
      // - Fluent is using colorCompoundBrandStroke
      // - we are using colorCompoundBrandForeground1Hover
      boxShadow: 'inset 0 -6px 0 -3px var(--webchat-colorCompoundBrandForeground1Hover)'
    }
  },

  'webchat-fluent__sendbox__sendbox-text': {
    backgroundColor: 'transparent',
    border: 'none',
    flex: 'auto',
    fontFamily: 'var(--webchat-fontFamilyBase)',
    fontSize: '14px',
    lineHeight: '20px',
    outline: 'none',
    padding: '4px 4px 0',
    resize: 'none'
  },

  'webchat-fluent__sendbox__sendbox-text--hidden': {
    visibility: 'hidden'
  },

  'webchat-fluent__sendbox__sendbox-controls': {
    alignItems: 'center',
    display: 'flex',
    paddingInlineStart: '4px'
  },

  'webchat-fluent__sendbox__text-counter': {
    color: 'var(--webchat-colorNeutralForeground4)',
    cursor: 'default',
    fontFamily: 'var(--webchat-fontFamilyNumeric)',
    fontSize: '10px',
    lineHeight: '14px'
  },

  'webchat-fluent__sendbox__text-counter--error': {
    color: 'var(--webchat-colorStatusDangerForeground1)'
  }
};

function SendBox(
  props: Readonly<{
    className?: string | undefined;
    placeholder?: string | undefined;
  }>
) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useSendBoxAttachments();
  const [{ maxMessageLength }] = useStyleOptions();
  const isMessageLengthExceeded = !!maxMessageLength && message.length > maxMessageLength;
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  const sendMessage = useSendMessage();
  const makeThumbnail = useMakeThumbnail();
  const errorMessageId = useUniqueId('webchat-fluent__sendbox__error-message-id');
  const [errorRef, errorMessage] = useSubmitError({ message, attachments });
  const [telephoneKeypadShown, setTelephoneKeypadShown] = useTelephoneKeypadShown();

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
    (dtmf: DTMF) => {
      // TODO: We need more official way of sending DTMF.
      sendMessage(`/DTMF ${dtmf}`);

      // TODO: In the future when we work on input modality, it should manage the focus in a better way.
      setTelephoneKeypadShown(false);
    },
    [sendMessage, setTelephoneKeypadShown]
  );

  const aria = {
    'aria-invalid': 'false' as const,
    ...(errorMessage && {
      'aria-invalid': 'true' as const,
      'aria-errormessage': errorMessageId
    })
  };

  return (
    <form {...aria} className={cx(classNames['webchat-fluent__sendbox'], props.className)} onSubmit={handleFormSubmit}>
      <SuggestedActions />
      <div className={cx(classNames['webchat-fluent__sendbox__sendbox'])} onClickCapture={handleSendBoxClick}>
        <TelephoneKeypadSurrogate
          autoFocus={true}
          isHorizontal={false}
          onButtonClick={handleTelephoneKeypadButtonClick}
        />
        <TextArea
          aria-label={isMessageLengthExceeded ? localize('TEXT_INPUT_LENGTH_EXCEEDED_ALT') : localize('TEXT_INPUT_ALT')}
          className={classNames['webchat-fluent__sendbox__sendbox-text']}
          data-testid={testIds.sendBoxTextBox}
          hidden={telephoneKeypadShown}
          onInput={handleMessageChange}
          placeholder={props.placeholder ?? localize('TEXT_INPUT_PLACEHOLDER')}
          ref={inputRef}
          value={message}
        />
        <Attachments attachments={attachments} />
        <div className={cx(classNames['webchat-fluent__sendbox__sendbox-controls'])}>
          {maxMessageLength && (
            <div
              className={cx(classNames['webchat-fluent__sendbox__text-counter'], {
                [classNames['webchat-fluent__sendbox__text-counter--error']]: isMessageLengthExceeded
              })}
            >
              {`${message.length}/${maxMessageLength}`}
            </div>
          )}
          <Toolbar>
            <TelephoneKeypadToolbarButton />
            <AddAttachmentButton onFilesAdded={handleAddFiles} />
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
