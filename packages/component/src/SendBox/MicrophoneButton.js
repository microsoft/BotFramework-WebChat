import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { Constants } from 'botframework-webchat-core';

import connectWithContext from '../connectWithContext';
import IconButton from './IconButton';
import MicrophoneIcon from './Assets/MicrophoneIcon';

const { DictateState } = Constants;

const ROOT_CSS = css({
  display: 'flex'
});

class MicrophoneButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const {
      props: {
        dictateState,
        onClick,
        startSpeechInput,
        stopSpeechInput
      }
    } = this;

    if (dictateState === DictateState.STARTING || dictateState === DictateState.DICTATING) {
      stopSpeechInput();
    } else {
      startSpeechInput();
    }

    onClick && onClick();
  }

  render() {
    const {
      props: { className, dictateState, disabled, styleSet }
    } = this;

    return (
      <div className={ classNames(
        styleSet.microphoneButton + '',
        ROOT_CSS + '',
        (className || '') + '',
        { dictating: dictateState === DictateState.DICTATING }
      ) }>
        <IconButton
          disabled={ disabled || (dictateState === DictateState.STARTING || dictateState === DictateState.STOPPING) }
          onClick={ this.handleClick }
        >
          <MicrophoneIcon />
        </IconButton>
      </div>
    );
  }
}

export default connectWithContext(
  ({
    disabled,
    dictateState,
    startSpeechInput,
    stopSpeechInput,
    styleSet
  }) => ({
    dictateState,
    disabled,
    startSpeechInput,
    stopSpeechInput,
    styleSet
  })
)(MicrophoneButton)
