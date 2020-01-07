import './BlurLens.css';

import classNames from 'classnames';
import React from 'react';
import { hooks } from 'botframework-webchat';

const { useSendBoxSpeechInterimsVisible } = hooks;

const BlurLens = () => {
  const [interimsVisible] = useSendBoxSpeechInterimsVisible();

  return <div className={classNames('App-BlurLens', { hide: !interimsVisible })} />;
};

export default BlurLens;
