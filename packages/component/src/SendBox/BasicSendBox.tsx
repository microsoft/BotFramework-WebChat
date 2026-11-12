import { SendBoxToolbarMiddlewareProxy, hooks } from 'botframework-webchat-api';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import { Constants } from 'botframework-webchat-core';
import cx from 'classnames';
import React, { memo, useCallback, type ClipboardEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useMakeThumbnail from '../hooks/useMakeThumbnail';
import useWebSpeechPonyfill from '../hooks/useWebSpeechPonyfill';
import useErrorMessageId from '../providers/internal/SendBox/useErrorMessageId';
import useSubmit from '../providers/internal/SendBox/useSubmit';
import { AttachmentBar } from './AttachmentBar/index';
import DictationInterims from './DictationInterims';
import DropZone from './DropZone';
import MicrophoneButton from './MicrophoneButton';
import styles from './SendBox.module.css';
import SendButton from './SendButton';
import SuggestedActions from './SuggestedActions';
import TextBox from './TextBox';

const {
  DictateState: { DICTATING, STARTING }
} = Constants;

const { useDirection, useDictateState, useSendBoxAttachments, useStyleOptions, useUIState } = hooks;

function useSendBoxSpeechInterimsVisible(): [boolean] {
  const [dictateState] = useDictateState();

  return [dictateState === STARTING || dictateState === DICTATING];
}

const basicSendBoxPropsSchema = pipe(
  object({
    className: optional(string())
  }),
  readonly()
);

type BasicSendBoxProps = InferInput<typeof basicSendBoxPropsSchema>;

function BasicSendBox(props: BasicSendBoxProps) {
  const { className } = validateProps(basicSendBoxPropsSchema, props);

  const [{ disableFileUpload, sendAttachmentOn, sendBoxButtonAlignment }] = useStyleOptions();
  const classNames = useStyles(styles, webChatPrefixedClassName);
  const [{ SpeechRecognition = undefined } = {}] = useWebSpeechPonyfill();
  const [direction] = useDirection();
  const [errorMessageId] = useErrorMessageId();
  const [sendBoxAttachments, setSendBoxAttachments] = useSendBoxAttachments();
  const [speechInterimsVisible] = useSendBoxSpeechInterimsVisible();
  const [uiState] = useUIState();
  const makeThumbnail = useMakeThumbnail();
  const submit = useSubmit();

  const disabled = uiState === 'disabled';
  const sendAttachmentOnRef = useRefFrom(sendAttachmentOn);
  const sendBoxAttachmentsRef = useRefFrom(sendBoxAttachments);

  const supportSpeechRecognition = !!SpeechRecognition;

  const handleAddFiles = useCallback(
    async (inputFiles: readonly File[]) => {
      const newAttachments = Object.freeze(
        await Promise.all(
          inputFiles.map(file =>
            makeThumbnail(file).then(thumbnailURL =>
              Object.freeze({ blob: file, ...(thumbnailURL && { thumbnailURL }) })
            )
          )
        )
      );

      setSendBoxAttachments(Object.freeze([].concat(sendBoxAttachmentsRef.current, newAttachments)));

      sendAttachmentOnRef.current === 'attach' && submit();
    },
    [makeThumbnail, sendAttachmentOnRef, sendBoxAttachmentsRef, setSendBoxAttachments, submit]
  );

  const handlePaste = useCallback<ClipboardEventHandler>(
    event => {
      if (disableFileUpload || disabled) {
        return;
      }

      const { files } = event.clipboardData;

      if (files.length) {
        event.preventDefault();
        handleAddFiles(Object.freeze(Array.from(files)));
      }
    },
    [disabled, disableFileUpload, handleAddFiles]
  );

  const buttonClassName = cx(classNames['send-box__button'], {
    [classNames['send-box__button--align-bottom']]: sendBoxButtonAlignment === 'bottom',
    [classNames['send-box__button--align-stretch']]:
      sendBoxButtonAlignment !== 'bottom' && sendBoxButtonAlignment !== 'top',
    [classNames['send-box__button--align-top']]: sendBoxButtonAlignment === 'top'
  });

  return (
    <div
      aria-describedby={errorMessageId}
      aria-errormessage={errorMessageId}
      aria-invalid={!!errorMessageId || undefined}
      className={cx(classNames['send-box'], className)}
      dir={direction}
      onPaste={handlePaste}
      role="form"
    >
      <SuggestedActions />
      <div className={classNames['send-box__main']}>
        <AttachmentBar className={classNames['send-box__attachment-bar']} />
        <SendBoxToolbarMiddlewareProxy className={buttonClassName} request={undefined} />
        <div className={classNames['send-box__editable']}>
          {speechInterimsVisible ? (
            <DictationInterims className={classNames['send-box__dictation-interims']} />
          ) : (
            <TextBox className={classNames['send-box__text-box']} />
          )}
        </div>
        {supportSpeechRecognition ? (
          <MicrophoneButton className={cx(buttonClassName, classNames['send-box__microphone-button'])} />
        ) : (
          <SendButton className={buttonClassName} />
        )}
      </div>
      {!disableFileUpload && !disabled && <DropZone onFilesAdded={handleAddFiles} />}
    </div>
  );
}

export default memo(BasicSendBox);
export { basicSendBoxPropsSchema, useSendBoxSpeechInterimsVisible, type BasicSendBoxProps };
