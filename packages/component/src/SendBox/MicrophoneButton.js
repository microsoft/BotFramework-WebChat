import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { Constants } from 'botframework-webchat-core';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import IconButton from './IconButton';
import MicrophoneIcon from './Assets/MicrophoneIcon';

const { DictateState } = Constants;

const ROOT_CSS = css({
  display: 'flex',

  '& > .sr-only': {
    color: 'transparent',
    height: 1,
    left: -10000,
    overflow: 'hidden',
    position: 'absolute',
    top: 'auto',
    width: 1
  }
});

const connectMicrophoneButton = (...selectors) => connectToWebChat(
  ({
    disabled,
    dictateState,
    language,
    startDictate,
    stopDictate
  }) => ({
    click: () => {
      if (dictateState === DictateState.STARTING || dictateState === DictateState.DICTATING) {
        stopDictate();
      } else {
        startDictate();
      }
    },
    dictating: dictateState === DictateState.DICTATING,
    disabled: disabled || (dictateState === DictateState.STARTING || dictateState === DictateState.STOPPING),
    language
  }),
  ...selectors
);

export default connectMicrophoneButton(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    className,
    click,
    dictating,
    disabled,
    language,
    styleSet
  }) =>
    <div
      aria-controls="webchatSendBoxMicrophoneButton"
      className={ classNames(
        styleSet.microphoneButton + '',
        ROOT_CSS + '',
        (className || '') + '',
        { dictating }
      ) }
    >
      <IconButton
        alt={ localize('Speak', language) }
        disabled={ disabled }
        onClick={ click }
      >
        <MicrophoneIcon />
      </IconButton>
      <div
        aria-live="polite"
        className="sr-only"
        id="webchatSendBoxMicrophoneButton"
        role="status"
      >
        { localize(dictating ? 'Microphone on' : 'Microphone off', language) }
      </div>
    </div>
)

export { connectMicrophoneButton }
