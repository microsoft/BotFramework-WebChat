import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { localize } from '../Localization/Localize';
import AttachmentIcon from './Assets/AttachmentIcon';
import connectToWebChat from '../connectToWebChat';
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

const connectUploadButton = (...selectors) =>
  connectToWebChat(
    ({ disabled, language, sendFiles }) => ({
      disabled,
      language,
      sendFiles: files => {
        if (files && files.length) {
          // TODO: [P3] We need to find revokeObjectURL on the UI side
          //       Redux store should not know about the browser environment
          //       One fix is to use ArrayBuffer instead of object URL, but that would requires change to DirectLineJS
          sendFiles(
            [].map.call(files, file => ({
              name: file.name,
              size: file.size,
              url: window.URL.createObjectURL(file)
            }))
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
    uploadButton: PropTypes.any.isRequired
  }).isRequired
};

export default connectUploadButton(({ styleSet }) => ({ styleSet }))(UploadButton);

export { connectUploadButton };
