import React from 'react';

import ScreenReaderText from '../ScreenReaderText';
import useLocalizer from '../hooks/useLocalizer';

const ConnectivityStatusConnected = () => {
  return <ScreenReaderText text={useLocalizer()('CONNECTIVITY_STATUS_ALT', useLocalize('CONNECTIVITY_STATUS_ALT_CONNECTED'))} />;
};

export default ConnectivityStatusConnected;
