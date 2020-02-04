import React from 'react';

import ScreenReaderText from '../../ScreenReaderText';
// TODO: Should we move ErrorNotificationIcon to under this folder?
import ErrorNotificationIcon from '../../Attachment/Assets/ErrorNotificationIcon';
import useLocalize from '../../hooks/useLocalize';
import useStyleSet from '../../hooks/useStyleSet';

const ConnectivityStatusFailedToConnect = () => {
  const [{ errorNotification: errorNotificationStyleSet }] = useStyleSet();
  const connectivityStatusLabelText = useLocalize('ConnectivityStatus');
  const failedConnectionText = useLocalize('FAILED_CONNECTION_NOTIFICATION');

  return (
    <React.Fragment>
      <ScreenReaderText text={connectivityStatusLabelText + failedConnectionText} />
      <div aria-hidden={true} className={errorNotificationStyleSet + ''}>
        <ErrorNotificationIcon />
        {failedConnectionText}
      </div>
    </React.Fragment>
  );
};

export default ConnectivityStatusFailedToConnect;
