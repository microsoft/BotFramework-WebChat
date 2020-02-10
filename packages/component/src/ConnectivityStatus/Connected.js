import React from 'react';

import ScreenReaderText from '../ScreenReaderText';
import useLocalizeCallback from '../hooks/useLocalizeCallback';

const ConnectivityStatusConnected = () => {
  return <ScreenReaderText text={useLocalizeCallback()('CONNECTIVITY_STATUS_ALT', useLocalize('CONNECTIVITY_STATUS_ALT_CONNECTED'))} />;
};

export default ConnectivityStatusConnected;
