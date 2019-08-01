import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { localize } from '../Localization/Localize';
import AttachmentIcon from './Assets/AttachmentIcon';
import connectToWebChat from '../connectToWebChat';
import downscaleImageToDataURL from '../Utils/downscaleImageToDataURL';
import IconButton from './IconButton';

const ROOT_CSS = css({
  overflow: 'hidden',
  position: 'relative',

  '& > input': {
    height: 0,
    width: 0,
    opacity: 0,
    position: 'absolute',
    left: 0,
    top: 0
  }
});

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

class UploadButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.inputRef = React.createRef();
  }

  handleClick() {
    const { current } = this.inputRef;

    current && current.click();
  }

  handleFileChange({ target: { files } }) {
    const { sendFiles } = this.props;

    sendFiles(files);

    const { current } = this.inputRef;

    if (current) {
      current.value = null;
    }
  }

  render() {
    const { disabled, language, styleSet } = this.props;
    const uploadFileString = localize('Upload file', language);

    return (
      <div className={classNames(ROOT_CSS + '', styleSet.uploadButton + '')}>
        <input
          aria-hidden="true"
          disabled={disabled}
          multiple={true}
          onChange={this.handleFileChange}
          ref={this.inputRef}
          role="button"
          tabIndex={-1}
          type="file"
        />
        <IconButton alt={uploadFileString} aria-label={uploadFileString} disabled={disabled} onClick={this.handleClick}>
          <AttachmentIcon />
        </IconButton>
      </div>
    );
  }
}

UploadButton.defaultProps = {
  disabled: false
};

UploadButton.propTypes = {
  disabled: PropTypes.bool,
  language: PropTypes.string.isRequired,
  sendFiles: PropTypes.func.isRequired,
  styleSet: PropTypes.shape({
    options: PropTypes.shape({
      enableUploadThumbnail: PropTypes.bool.isRequired,
      uploadThumbnailContentType: PropTypes.string.isRequired,
      uploadThumbnailHeight: PropTypes.number.isRequired,
      uploadThumbnailQuality: PropTypes.number.isRequired,
      uploadThumbnailWidth: PropTypes.number.isRequired
    }).isRequired,
    uploadButton: PropTypes.any.isRequired
  }).isRequired
};

export default connectUploadButton(({ styleSet }) => ({ styleSet }))(UploadButton);

export { connectUploadButton };
