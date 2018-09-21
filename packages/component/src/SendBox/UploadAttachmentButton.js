import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import Context from '../Context';
import AttachmentIcon from './Assets/AttachmentIcon';

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

class UploadAttachmentButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleFileChange = this.handleFileChange.bind(this);
    this.inputRef = React.createRef();
  }

  handleFileChange({ target: { files } }) {
    if (files && files.length) {
      const { current } = this.inputRef;

      // TODO: [P3] We need to find revokeObjectURL on the UI side
      //       Redux store should not know about the browser environment
      //       One fix is to use ArrayBuffer instead of object URL, but that would requires change to DirectLineJS
      this.props.sendFiles([].map.call(files, file => ({
        name: file.name,
        size: file.size,
        url: window.URL.createObjectURL(file)
      })));

      current.value = null;
    }
  }

  render() {
    const { disabled, styleSet } = this.props;

    return (
      <div className={ classNames(ROOT_CSS + '', styleSet.uploadButton + '') }>
        <input
          disabled={ disabled }
          multiple={ true }
          onChange={ this.handleFileChange }
          ref={ this.inputRef }
          type="file"
        />
        <div className={ classNames('icon', { disabled }) }>
          <AttachmentIcon />
        </div>
      </div>
    );
  }
}

export default props =>
  <Context.Consumer>
    { ({ disabled, sendFiles, styleSet }) =>
      <UploadAttachmentButton
        disabled={ disabled }
        sendFiles={ sendFiles }
        styleSet={ styleSet }
        { ...props }
      />
    }
  </Context.Consumer>
