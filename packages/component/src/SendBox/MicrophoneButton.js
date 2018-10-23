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

const connectMicrophoneButton = (...selectors) => connectWithContext(
  ({
    disabled,
    dictateState,
    startDictate,
    stopDictate
  }) => ({
    dictating: dictateState === DictateState.DICTATING,
    disabled: disabled || (dictateState === DictateState.STARTING || dictateState === DictateState.STOPPING),
    onClick: () => {
      if (dictateState === DictateState.STARTING || dictateState === DictateState.DICTATING) {
        stopDictate();
      } else {
        startDictate();
      }
    }
  }),
  ...selectors
);

export default connectMicrophoneButton(
  ({ styleSet }) => ({ styleSet })
)(
  ({ className, dictating, disabled, onClick, styleSet }) =>
    <div className={ classNames(
      styleSet.microphoneButton + '',
      ROOT_CSS + '',
      (className || '') + '',
      { dictating }
    ) }>
      <IconButton
        disabled={ disabled }
        onClick={ onClick }
      >
        <MicrophoneIcon />
      </IconButton>
    </div>
)

export { connectMicrophoneButton }
