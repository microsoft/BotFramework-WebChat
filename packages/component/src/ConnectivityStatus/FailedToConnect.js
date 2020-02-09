import classNames from 'classnames';
import React from 'react';

import ErrorNotificationIcon from './Assets/ErrorNotificationIcon';
import ScreenReaderText from '../ScreenReaderText';
import useLocalize from '../hooks/useLocalize';
import useStyleSet from '../hooks/useStyleSet';

const ConnectivityStatusFailedToConnect = () => {
  const [{ errorNotification: errorNotificationStyleSet }] = useStyleSet();
  const connectivityStatusLabelText = useLocalize('ConnectivityStatus');
  const failedConnectionText = useLocalize('FAILED_CONNECTION_NOTIFICATION');

  return (
    <React.Fragment>
      <ScreenReaderText text={connectivityStatusLabelText + failedConnectionText} />
      <div aria-hidden={true} className={classNames('webchat__connectivityStatus', errorNotificationStyleSet + '')}>
        <ErrorNotificationIcon />
        {failedConnectionText}
      </div>
    </React.Fragment>
  );
};

export default ConnectivityStatusFailedToConnect;
