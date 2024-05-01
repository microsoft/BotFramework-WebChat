import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, type FC, type FormEventHandler, type MouseEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';

import IconButton from '../SendBox/IconButton';
import useMakeThumbnail from '../hooks/useMakeThumbnail';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';
import useFocus from '../hooks/useFocus';
import useStyleSet from '../hooks/useStyleSet';
import useSubmit from '../providers/internal/SendBox/useSubmit';
import AttachmentIcon from './Assets/AttachmentIcon';

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
    }
  }
};

const PREVENT_DEFAULT_HANDLER = event => event.preventDefault();

type UploadButtonProps = {
  className?: string;
};

const UploadButton: FC<UploadButtonProps> = ({ className }) => {
  const [{ sendAttachmentOn, uploadAccept, uploadMultiple }] = useStyleOptions();
  const [{ uploadButton: uploadButtonStyleSet }] = useStyleSet();
  const [disabled] = useDisabled();
  const [sendBoxAttachments, setSendBoxAttachments] = useSendBoxAttachments();
  const focus = useFocus();
  const inputRef = useRef<HTMLInputElement>(null);
  const localize = useLocalizer();
  const makeThumbnail = useMakeThumbnail();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const submit = useSubmit();

  const sendAttachmentOnRef = useRefFrom(sendAttachmentOn);
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
          Object.freeze(
            await Promise.all(
              [...currentTarget.files].map(blob => makeThumbnail(blob).then(thumbnailURL => ({ blob, thumbnailURL })))
            )
          )
        );

        sendAttachmentOnRef.current === 'attach' && submit();
      })();
    },
    [focus, makeThumbnail, sendAttachmentOnRef, setSendBoxAttachments, submit]
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
        <AttachmentIcon checked={!!sendBoxAttachments.length} />
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
