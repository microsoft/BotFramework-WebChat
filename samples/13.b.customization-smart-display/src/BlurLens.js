import './BlurLens.css';

import classNames from 'classnames';
import React from 'react';
import { hooks } from 'botframework-webchat';

const { useSendBoxDictationStarted } = hooks;

const BlurLens = () => {
  const [dictating] = useSendBoxDictationStarted();
  const hide = !dictating;

  return <div className={classNames('App-BlurLens', { hide })} />;
};

export default BlurLens;
