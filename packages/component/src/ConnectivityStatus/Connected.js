import React from 'react';

import ScreenReaderText from '../ScreenReaderText';
import useLocalizer from '../hooks/useLocalizer';

const ConnectivityStatusConnected = () => {
  const localize = useLocalizer();

  return <ScreenReaderText text={localize('CONNECTIVITY_STATUS_ALT', localize('CONNECTIVITY_STATUS_ALT_CONNECTED'))} />;
};

export default ConnectivityStatusConnected;
