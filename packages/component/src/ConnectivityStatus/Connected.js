import { hooks } from 'botframework-webchat-api';
import React from 'react';

import ScreenReaderText from '../ScreenReaderText';

const { useLocalizer } = hooks;

const ConnectivityStatusConnected = () => {
  const localize = useLocalizer();

  return <ScreenReaderText text={localize('CONNECTIVITY_STATUS_ALT', localize('CONNECTIVITY_STATUS_ALT_CONNECTED'))} />;
};

export default ConnectivityStatusConnected;
