import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import AttachmentIcon from './Assets/AttachmentIcon';

import { localize } from '../Localization/Localize';

const ROOT_CSS = css({
  overflow: 'hidden',
  position: 'relative',

  '& > input': {
    height: '100%',
    opacity: 0,
    position: 'absolute',
    right: 0,
    top: 0,

    '&:not(:disabled)': {
      cursor: 'pointer'
    }
  },

  '& > .icon': {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    height: '100%',

    '&.disabled > svg': {
      fill: '#CCC'
    }
  }
});

const connectUploadAttachmentButton = (...selectors) => connectToWebChat(
  ({
    disabled,
    language,
    sendFiles
  }) => ({
    disabled,
    language,
    sendFiles: files => {
      if (files && files.length) {
        // TODO: [P3] We need to find revokeObjectURL on the UI side
        //       Redux store should not know about the browser environment
        //       One fix is to use ArrayBuffer instead of object URL, but that would requires change to DirectLineJS
        sendFiles([].map.call(files, file => ({
          name: file.name,
          size: file.size,
          url: window.URL.createObjectURL(file)
        })));
      }
    }
  }),
  ...selectors
)

class UploadAttachmentButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleFileChange = this.handleFileChange.bind(this);
    this.inputRef = React.createRef();
  }

  handleFileChange(event) {
    this.props.sendFiles(event.target.files);

    const { current } = this.inputRef;

    if (current) {
      current.value = null;
    }
  }

  render() {
    const { disabled, language, styleSet } = this.props;
    const uploadFileString = localize('Upload file', language);

    return (
      <div className={ classNames(ROOT_CSS + '', styleSet.uploadButton + '') }>
        <input
          disabled={ disabled }
          multiple={ true }
          onChange={ this.handleFileChange }
          ref={ this.inputRef }
          role="button"
          title={ uploadFileString }
          type="file"
        />
        <div className={ classNames('icon', { disabled }) }>
          <AttachmentIcon />
        </div>
      </div>
    );
  }
}

export default connectUploadAttachmentButton(
  ({
    disabled,
    language,
    sendFiles,
    styleSet
  }) => ({
    disabled,
    language,
    sendFiles,
    styleSet
  })
)(UploadAttachmentButton)

export { connectUploadAttachmentButton }
