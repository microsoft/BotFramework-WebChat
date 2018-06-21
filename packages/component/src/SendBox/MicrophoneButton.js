import { css } from 'glamor';
import React from 'react';

import MicrophoneIcon from './Assets/MicrophoneIcon';

const ROOT_CSS = css({
  backgroundColor: 'Transparent',
  border: 0,
  cursor: 'pointer',
  padding: 0,
  width: 40
});

export default class MicrophoneButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <button
        className={ ROOT_CSS }
      >
        <MicrophoneIcon />
      </button>
    );
  }
}
