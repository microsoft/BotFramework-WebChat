import './BlurLens.css';

import { hooks } from 'botframework-webchat';
import classNames from 'classnames';
import React, { memo } from 'react';

const { useSendBoxSpeechInterimsVisible } = hooks;

function BlurLens() {
  const [interimsVisible] = useSendBoxSpeechInterimsVisible();

  return <div className={classNames('App-BlurLens', { hide: !interimsVisible })} />;
}

export default memo(BlurLens);
