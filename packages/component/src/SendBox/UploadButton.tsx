import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { FC, useCallback, useRef } from 'react';

import AttachmentIcon from './Assets/AttachmentIcon';
import connectToWebChat from '../connectToWebChat';
import downscaleImageToDataURL from '../Utils/downscaleImageToDataURL/index';
import IconButton from './IconButton';
import useSendFiles from '../hooks/useSendFiles';
import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

const { useDisabled, useLocalizer } = hooks;

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
  const [{ uploadButton: uploadButtonStyleSet }] = useStyleSet();
  const [disabled] = useDisabled();
  const inputRef = useRef<HTMLInputElement>();
  const localize = useLocalizer();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const sendFiles = useSendFiles();

  const { current } = inputRef;
  const uploadFileString = localize('TEXT_INPUT_UPLOAD_BUTTON_ALT');

  const handleClick = useCallback(() => {
    current && current.click();
  }, [current]);

  const handleFileChange = useCallback(
    ({ target: { files } }) => {
      sendFiles(files);

      if (current) {
        current.value = null;
      }
    },
    [current, sendFiles]
  );

  return (
    <div className={classNames(rootClassName, 'webchat__upload-button', uploadButtonStyleSet + '', className)}>
      <input
        aria-disabled={disabled}
        aria-hidden="true"
        className="webchat__upload-button--file-input"
        multiple={true}
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
