import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, type FC, type FormEventHandler, type MouseEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';

import downscaleImageToDataURL from '../Utils/downscaleImageToDataURL/index';
import connectToWebChat from '../connectToWebChat';
import useConvertFileToAttachment from '../hooks/internal/useConvertFileToAttachment';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';
import useFocus from '../hooks/useFocus';
import useStyleSet from '../hooks/useStyleSet';
import useSubmit from '../providers/internal/SendBox/useSubmit';
import AttachmentIcon from './Assets/AttachmentIcon';
import CheckIcon from './Assets/CheckIcon';
import IconButton from './IconButton';

const { useDisabled, useSendBoxAttachments, useLocalizer, useStyleOptions } = hooks;

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
    },
    '& .webchat__icon-button--file-attached': {
      position: 'absolute',
      left: '45%',
      top: '50%',
      // White border around the check icon
      border: '2px solid white',
      borderRadius: '50%'
    }
  }
};

const PREVENT_DEFAULT_HANDLER = event => event.preventDefault();

async function makeThumbnail(file, width, height, contentType, quality) {
  if (/\.(gif|jpe?g|png)$/iu.test(file.name)) {
    try {
      return await downscaleImageToDataURL(file, width, height, contentType, quality);
    } catch (error) {
      console.warn(`Web Chat: Failed to downscale image due to ${error}.`);
    }
  }
}

const connectUploadButton = (...selectors) =>
  connectToWebChat(
    ({
      disabled,
      language,
      sendFiles,
      styleSet: {
        options: {
          enableUploadThumbnail,
          uploadThumbnailContentType,
          uploadThumbnailHeight,
          uploadThumbnailQuality,
          uploadThumbnailWidth
        }
      }
    }) => ({
      disabled,
      language,
      sendFiles: async files => {
        if (files && files.length) {
          // TODO: [P3] We need to find revokeObjectURL on the UI side
          //       Redux store should not know about the browser environment
          //       One fix is to use ArrayBuffer instead of object URL, but that would requires change to DirectLineJS
          sendFiles(
            await Promise.all(
              [].map.call(files, async file => ({
                name: file.name,
                size: file.size,
                url: window.URL.createObjectURL(file),
                ...(enableUploadThumbnail && {
                  thumbnail: await makeThumbnail(
                    file,
                    uploadThumbnailWidth,
                    uploadThumbnailHeight,
                    uploadThumbnailContentType,
                    uploadThumbnailQuality
                  )
                })
              }))
            )
          );
        }
      }
    }),
    ...selectors
  );

type UploadButtonProps = {
  className?: string;
};

const UploadButton: FC<UploadButtonProps> = ({ className }) => {
  const [{ sendAttachmentOn, uploadAccept, uploadMultiple }] = useStyleOptions();
  const [{ uploadButton: uploadButtonStyleSet }] = useStyleSet();
  const [disabled] = useDisabled();
  const [sendBoxAttachments, setSendBoxAttachments] = useSendBoxAttachments();
  const convertFileToAttachment = useConvertFileToAttachment();
  const focus = useFocus();
  const inputRef = useRef<HTMLInputElement>();
  const localize = useLocalizer();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const submit = useSubmit();

  const uploadFileString = localize('TEXT_INPUT_UPLOAD_BUTTON_ALT');
  const sendAttachmentOnRef = useRefFrom(sendAttachmentOn);

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(() => inputRef.current?.click(), [inputRef]);

  const handleFileChange = useCallback<FormEventHandler<HTMLInputElement>>(
    ({ currentTarget }) => {
      // We should change the focus synchronously for accessibility reason.
      focus('sendBox');

      // TODO: We should disable send button while we are creating thumbnails.
      //       Otherwise, if the user click the send button too quickly, it will not attach any files.
      (async function () {
        const files = [...currentTarget.files];

        setSendBoxAttachments(Object.freeze(await Promise.all([...files].map(convertFileToAttachment))));

        sendAttachmentOnRef.current === 'attach' && submit();
      })();
    },
    [convertFileToAttachment, focus, sendAttachmentOnRef, setSendBoxAttachments, submit]
  );

  return (
    <div className={classNames(rootClassName, 'webchat__upload-button', uploadButtonStyleSet + '', className)}>
      <input
        accept={uploadAccept}
        aria-disabled={disabled}
        aria-hidden="true"
        className="webchat__upload-button--file-input"
        multiple={uploadMultiple}
        onChange={disabled ? undefined : handleFileChange}
        onClick={disabled ? PREVENT_DEFAULT_HANDLER : undefined}
        readOnly={disabled}
        ref={inputRef}
        role="button"
        tabIndex={-1}
        type="file"
      />
      <IconButton alt={uploadFileString} aria-label={uploadFileString} disabled={disabled} onClick={handleClick}>
        <AttachmentIcon />
        {/* When a file is attached, overlay the check icon */}
        {!!sendBoxAttachments.length && <CheckIcon />}
      </IconButton>
    </div>
  );
};

UploadButton.defaultProps = {
  className: undefined
};

UploadButton.propTypes = {
  className: PropTypes.string
};

export default UploadButton;

export { connectUploadButton };
