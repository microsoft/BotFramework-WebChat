import { hooks } from 'botframework-webchat-api';
import { validateProps } from 'botframework-webchat-react-valibot';
import classNames from 'classnames';
import random from 'math-random';
import React, { memo, useCallback, useRef, useState, type FormEventHandler, type MouseEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';
import { object, pipe, readonly, string, type InferInput } from 'valibot';

import IconButton from '../SendBox/IconButton';
import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
import useFocus from '../hooks/useFocus';
import useMakeThumbnail from '../hooks/useMakeThumbnail';
import useStyleSet from '../hooks/useStyleSet';
import useSubmit from '../providers/internal/SendBox/useSubmit';
import AttachmentIcon from './Assets/AttachmentIcon';
import testIds from '../testIds';

const { useSendBoxAttachments, useLocalizer, useStyleOptions, useUIState } = hooks;

const ROOT_STYLE = {
  '&.webchat__upload-button': {
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',

    '& .webchat__upload-button--file-input': {
      height: 0,
      width: 0,
      opacity: 0,
      position: 'absolute',
      left: 0,
      top: 0
    }
  }
};

const PREVENT_DEFAULT_HANDLER = event => event.preventDefault();

const uploadButtonPropsSchema = pipe(
  object({
    className: string()
  }),
  readonly()
);

type UploadButtonProps = InferInput<typeof uploadButtonPropsSchema>;

function UploadButton(props: UploadButtonProps) {
  const { className } = validateProps(uploadButtonPropsSchema, props);

  const [{ sendAttachmentOn, uploadAccept, uploadMultiple }] = useStyleOptions();
  const [{ uploadButton: uploadButtonStyleSet }] = useStyleSet();
  const [inputKey, setInputKey] = useState<number>(0);
  const [sendBoxAttachments, setSendBoxAttachments] = useSendBoxAttachments();
  const [uiState] = useUIState();
  const focus = useFocus();
  const inputRef = useRef<HTMLInputElement>(null);
  const localize = useLocalizer();
  const makeThumbnail = useMakeThumbnail();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const submit = useSubmit();

  const disabled = uiState === 'disabled';
  const sendAttachmentOnRef = useRefFrom(sendAttachmentOn);
  const sendBoxAttachmentsRef = useRefFrom(sendBoxAttachments);
  const uploadFileString = localize('TEXT_INPUT_UPLOAD_BUTTON_ALT');

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(() => inputRef.current?.click(), [inputRef]);

  const handleFileChange = useCallback<FormEventHandler<HTMLInputElement>>(
    ({ currentTarget }) => {
      // We should change the focus synchronously for accessibility reason.
      focus('sendBox');

      // TODO: [P2] We should disable send button while we are creating thumbnails.
      //            Otherwise, if the user click the send button too quickly, it will not attach any files.
      (async function () {
        setSendBoxAttachments(
          Object.freeze([
            ...sendBoxAttachmentsRef.current,
            ...(await Promise.all(
              Array.from(currentTarget.files).map(async (blob: File) => {
                const entry = sendBoxAttachmentsRef.current.find(entry => entry.blob === blob);

                if (entry) {
                  return entry;
                }

                const thumbnailURL = await makeThumbnail(blob);

                return { blob, thumbnailURL };
              })
            ))
          ])
        );

        setInputKey(random());

        sendAttachmentOnRef.current === 'attach' && submit();
      })();
    },
    [focus, makeThumbnail, sendBoxAttachmentsRef, sendAttachmentOnRef, setInputKey, setSendBoxAttachments, submit]
  );

  return (
    <div className={classNames(rootClassName, 'webchat__upload-button', uploadButtonStyleSet + '', className)}>
      <input
        accept={uploadAccept}
        aria-disabled={disabled}
        aria-hidden="true"
        className="webchat__upload-button--file-input"
        // Recreates the <input> element after every upload to prevent issues in WebDriver.
        // Otherwise, on second upload, WebDriver will resend files from first upload as new Blob/File instance and it will cause duplicates.
        key={inputKey}
        multiple={uploadMultiple}
        onChange={disabled ? undefined : handleFileChange}
        onClick={disabled ? PREVENT_DEFAULT_HANDLER : undefined}
        readOnly={disabled}
        ref={inputRef}
        role="button"
        tabIndex={-1}
        type="file"
      />
      <IconButton
        alt={uploadFileString}
        aria-label={uploadFileString}
        data-testid={testIds.basicSendBoxUploadButton}
        disabled={disabled}
        onClick={handleClick}
      >
        <AttachmentIcon checked={!!sendBoxAttachments.length} />
      </IconButton>
    </div>
  );
}

export default memo(UploadButton);
export { uploadButtonPropsSchema, type UploadButtonProps };
