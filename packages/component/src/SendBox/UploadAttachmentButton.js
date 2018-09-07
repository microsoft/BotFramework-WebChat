import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import Context from '../Context';
import AttachmentIcon from './Assets/AttachmentIcon';

const ROOT_CSS = css({
  overflow: 'hidden',
  position: 'relative',

  '& > input': {
    cursor: 'pointer',
    height: '100%',
    opacity: 0,
    position: 'absolute',
    right: 0,
    top: 0
  },

  '& > .icon': {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    height: '100%'
  }
});

class UploadAttachmentButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleFileChange = this.handleFileChange.bind(this);
    this.inputRef = React.createRef();
  }

  handleFileChange({ target: { files } }) {
    if (files && files.length) {
      const { current } = this.inputRef;

      // TODO: We need to find revokeObjectURL on the UI side
      //       Redux store should not know about the browser environment
      //       One fix is to use ArrayBuffer instead of object URL
      this.props.sendFiles([].map.call(files, file => ({
        name: file.name,
        size: file.size,
        url: window.URL.createObjectURL(file)
      })));

      current.value = null;
    }
  }

  render() {
    const { styleSet } = this.props;

    return (
      <div className={ classNames(ROOT_CSS + '', styleSet.uploadButton + '') }>
        <input
          multiple={ true }
          onChange={ this.handleFileChange }
          ref={ this.inputRef }
          type="file"
        />
        <div className="icon">
          <AttachmentIcon />
        </div>
      </div>
    );
  }
}

export default props =>
  <Context.Consumer>
    { ({ sendFiles, styleSet }) =>
      <UploadAttachmentButton
        sendFiles={ sendFiles }
        styleSet={ styleSet }
        { ...props }
      />
    }
  </Context.Consumer>
