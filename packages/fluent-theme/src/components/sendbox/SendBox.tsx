import React, { type MouseEventHandler, useCallback, useRef, useState } from 'react';
import cx from 'classnames';
import { hooks } from 'botframework-webchat-api';
import type { DirectLineCardAction, WebChatActivity } from 'botframework-webchat-core';
import { SendIcon } from '../../icons/SendIcon';
import { ToolbarButton, ToolbarSeparator, Toolbar } from './Toolbar';
import { SuggestedActions } from './SuggestedActions';
import { AddAttachmentButton, Attachments } from './Attachments';
import DropZone from './DropZone';
import { TextArea } from './TextArea';
import { DialpadIcon } from '../../icons/DialpadIcon';
import { useStyles } from '../../styles';

const { useLocalizer } = hooks;

const styles = {
  webchat__sendbox: {
    color: 'var(--colorNeutralForeground1)',
    fontFamily: 'var(--fontFamilyBase)',
    textRendering: 'optimizeLegibility'
  },

  webchat__sendbox__sendbox: {
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

  'webchat__sendbox__sendbox-text': {
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

  'webchat__sendbox__sendbox-controls': {
    alignItems: 'center',
    display: 'flex',
    paddingInlineStart: '4px'
  },

  'webchat__sendbox__text-counter': {
    color: 'var(--colorNeutralForeground4)',
    cursor: 'default',
    fontFamily: 'var(--fontFamilyNumeric)',
    fontSize: '10px',
    lineHeight: '14px'
  },

  'webchat__sendbox__text-counter--error': {
    color: 'var(--colorStatusDangerForeground1)'
  }
};

export default function SendBox(
  props: Readonly<{
    readonly className?: string | undefined;
    readonly errorMessageId?: string | undefined;
    readonly maxMessageLength?: number | undefined;
    readonly onPostMessage?: ((activity: Partial<WebChatActivity>) => void) | undefined;
    readonly placeholder?: string | undefined;
    readonly suggestedActions?: Partial<DirectLineCardAction>[] | undefined;
  }>
) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<Readonly<File[]>>([]);
  const isMessageLengthExceeded = !!props.maxMessageLength && message.length > props.maxMessageLength;
  const classNames = useStyles(styles);
  const localize = useLocalizer();

  const handleReplyClick = useCallback((action: Partial<DirectLineCardAction>) => {
    if ('displayText' in action) {
      props.onPostMessage?.({ text: action.displayText });
    }
  }, []);

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
    (inputFiles: File[]) => {
      setFiles(files => files.concat(inputFiles));
    },
    [setFiles]
  );

  const handleSendClick = useCallback(() => {
    props.onPostMessage?.({
      text: message,
      attachments: files.map(file => ({
        contentType: file.type,
        name: file.name
      }))
    });
    setMessage('');
    setFiles([]);
  }, [props, message, files, setMessage, setFiles]);

  const aria = {
    role: 'form',
    'aria-invalid': 'false' as const,
    ...(props.errorMessageId && {
      'aria-invalid': 'true' as const,
      'aria-errormessage': props.errorMessageId
    })
  };

  return (
    <div className={cx(classNames.webchat__sendbox, props.className)} {...aria}>
      {props.suggestedActions && (
        <SuggestedActions onActionClick={handleReplyClick} suggestedActions={props.suggestedActions} />
      )}
      <div className={cx(classNames.webchat__sendbox__sendbox)} onClickCapture={handleSendBoxClick}>
        <TextArea
          className={cx(classNames['webchat__sendbox__sendbox-text'])}
          onInput={handleMessageChange}
          placeholder={props.placeholder ?? localize('TEXT_INPUT_PLACEHOLDER')}
          ref={inputRef}
          value={message}
        />
        <Attachments files={files} />
        <div className={cx(classNames['webchat__sendbox__sendbox-controls'])}>
          {props.maxMessageLength && (
            <div
              className={cx(classNames['webchat__sendbox__text-counter'], {
                [classNames['webchat__sendbox__text-counter--error']]: isMessageLengthExceeded
              })}
            >
              {`${message.length}/${props.maxMessageLength}`}
            </div>
          )}
          <Toolbar>
            <ToolbarButton aria-label={localize('TEXT_INPUT_DIALPAD_BUTTON_ALT')}>
              <DialpadIcon />
            </ToolbarButton>
            <AddAttachmentButton onFilesAdded={handleAddFiles} />
            <ToolbarSeparator />
            <ToolbarButton
              aria-label={localize('TEXT_INPUT_SEND_BUTTON_ALT')}
              disabled={isMessageLengthExceeded}
              onClick={handleSendClick}
            >
              <SendIcon />
            </ToolbarButton>
          </Toolbar>
        </div>
        <DropZone onFilesAdded={handleAddFiles} />
      </div>
    </div>
  );
}
