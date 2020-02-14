import React from 'react';

import ScreenReaderText from '../ScreenReaderText';
import useLocalize from '../hooks/useLocalize';

const ConnectivityStatusConnected = () => {
  const connectivityStatusLabelText = useLocalize('ConnectivityStatus');
  const connectedNotificationText = useLocalize('CONNECTED_NOTIFICATION');

  return <ScreenReaderText text={connectivityStatusLabelText + connectedNotificationText} />;
};

export default ConnectivityStatusConnected;
