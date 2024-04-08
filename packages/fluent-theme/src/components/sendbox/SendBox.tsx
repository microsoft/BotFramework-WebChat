import { hooks } from 'botframework-webchat-component';
import cx from 'classnames';
import React, { useCallback, useRef, useState, type FormEventHandler, type MouseEventHandler } from 'react';
import { SendIcon } from '../../icons/SendIcon';
import { TelephoneKeypadIcon } from '../../icons/TelephoneKeypad';
import { useStyles } from '../../styles';
import { AddAttachmentButton, Attachments } from './Attachments';
import DropZone from './DropZone';
import { SuggestedActions } from './SuggestedActions';
import { TextArea } from './TextArea';
import { Toolbar, ToolbarButton, ToolbarSeparator } from './Toolbar';

const { useMakeThumbnail, useLocalizer, useSendMessage } = hooks;

const styles = {
  'webchat-fluent__sendbox': {
    color: 'var(--colorNeutralForeground1)',
    fontFamily: 'var(--fontFamilyBase)',
    textRendering: 'optimizeLegibility'
  },

  'webchat-fluent__sendbox__sendbox': {
    backgroundColor: 'var(--colorNeutralBackground1)',
    border: '1px solid var(--colorNeutralStroke1)',
    borderRadius: 'var(--borderRadiusLarge)',
    display: 'grid',
    fontFamily: 'var(--fontFamilyBase)',
    fontSize: '14px',
    gap: '6px',
    lineHeight: '20px',
    padding: '8px',
    position: 'relative',

    '&:focus-within': {
      borderColor: 'var(--colorNeutralStroke1Selected)',
      boxShadow: 'inset 0 -6px 0 -3px var(--colorCompoundBrandForeground2)'
    }
  },

  'webchat-fluent__sendbox__sendbox-text': {
    backgroundColor: 'transparent',
    border: 'none',
    flex: 'auto',
    fontFamily: 'var(--fontFamilyBase)',
    fontSize: '14px',
    lineHeight: '20px',
    outline: 'none',
    padding: '4px 4px 0',
    resize: 'none'
  },

  'webchat-fluent__sendbox__sendbox-controls': {
    alignItems: 'center',
    display: 'flex',
    paddingInlineStart: '4px'
  },

  'webchat-fluent__sendbox__text-counter': {
    color: 'var(--colorNeutralForeground4)',
    cursor: 'default',
    fontFamily: 'var(--fontFamilyNumeric)',
    fontSize: '10px',
    lineHeight: '14px'
  },

  'webchat-fluent__sendbox__text-counter--error': {
    color: 'var(--colorStatusDangerForeground1)'
  }
};

export default function SendBox(
  props: Readonly<{
    className?: string | undefined;
    errorMessageId?: string | undefined;
    maxMessageLength?: number | undefined;
    placeholder?: string | undefined;
  }>
) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<
    Readonly<{
      blob: File;
      thumbnailURL?: URL;
    }>[]
  >([]);
  const isMessageLengthExceeded = !!props.maxMessageLength && message.length > props.maxMessageLength;
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  const sendMessage = useSendMessage();
  const makeThumbnail = useMakeThumbnail();

  const handleSendBoxClick = useCallback<MouseEventHandler>(
    event => {
      if ('tabIndex' in event.target && typeof event.target.tabIndex === 'number' && event.target.tabIndex >= 0) {
        return;
      }
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
            makeThumbnail(file, /\.(gif|jpe?g|png)$/iu.test(file.name) ? 'image/*' : 'application/octet-stream').then(
              thumbnailURL =>
                Object.freeze({
                  blob: file,
                  ...(thumbnailURL && { thumbnailURL })
                })
            )
          )
        )
      );

      setAttachments(attachments.concat(newAttachments));
    },
    [attachments, makeThumbnail]
  );

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    event => {
      event.preventDefault();
      sendMessage(message, undefined, {
        attachments
      });
      setMessage('');
      setAttachments([]);
    },
    [attachments, sendMessage, message]
  );

  const aria = {
    'aria-invalid': 'false' as const,
    ...(props.errorMessageId && {
      'aria-invalid': 'true' as const,
      'aria-errormessage': props.errorMessageId
    })
  };

  return (
    <form className={cx(classNames['webchat-fluent__sendbox'], props.className)} onSubmit={handleFormSubmit} {...aria}>
      <SuggestedActions />
      <div className={cx(classNames['webchat-fluent__sendbox__sendbox'])} onClickCapture={handleSendBoxClick}>
        <TextArea
          ariaLabel={isMessageLengthExceeded ? localize('TEXT_INPUT_LENGTH_EXCEEDED_ALT') : null}
          className={cx(classNames['webchat-fluent__sendbox__sendbox-text'])}
          onInput={handleMessageChange}
          placeholder={props.placeholder ?? localize('TEXT_INPUT_PLACEHOLDER')}
          ref={inputRef}
          value={message}
        />
        <Attachments attachments={attachments} />
        <div className={cx(classNames['webchat-fluent__sendbox__sendbox-controls'])}>
          {props.maxMessageLength && (
            <div
              className={cx(classNames['webchat-fluent__sendbox__text-counter'], {
                [classNames['webchat-fluent__sendbox__text-counter--error']]: isMessageLengthExceeded
              })}
            >
              {`${message.length}/${props.maxMessageLength}`}
            </div>
          )}
          <Toolbar>
            <ToolbarButton aria-label={localize('TEXT_INPUT_TELEPHON_KEYPAD_BUTTON_ALT')}>
              <TelephoneKeypadIcon />
            </ToolbarButton>
            <AddAttachmentButton onFilesAdded={handleAddFiles} />
            <ToolbarSeparator />
            <ToolbarButton
              aria-label={localize('TEXT_INPUT_SEND_BUTTON_ALT')}
              disabled={isMessageLengthExceeded}
              submit={true}
            >
              <SendIcon />
            </ToolbarButton>
          </Toolbar>
        </div>
        <DropZone onFilesAdded={handleAddFiles} />
      </div>
    </form>
  );
}
