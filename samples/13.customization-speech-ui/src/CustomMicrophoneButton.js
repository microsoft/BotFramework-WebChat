import classNames from 'classnames';
import React from 'react';
import { Components } from 'botframework-webchat';

import MicrophoneIcon from './MicrophoneIcon';

const { connectMicrophoneButton } = Components;

export default connectMicrophoneButton()(
  ({
    className,
    click,
    dictating,
    disabled
  }) =>
    <button
      className={ classNames(className, { dictating }) }
      disabled={ disabled }
      onClick={ click }
    >
      <MicrophoneIcon size="10vmin" />
    </button>
)
