import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React from 'react';

import ErrorNotificationIcon from './Assets/ErrorNotificationIcon';
import ScreenReaderText from '../ScreenReaderText';
import useStyleSet from '../hooks/useStyleSet';

const { useDirection, useLocalizer } = hooks;

const ConnectivityStatusFailedToConnect = () => {
  const [{ errorNotification: errorNotificationStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const localize = useLocalizer();

  const failedConnectionText = localize('CONNECTIVITY_STATUS_ALT_FATAL');

  return (
    <React.Fragment>
      <ScreenReaderText text={localize('CONNECTIVITY_STATUS_ALT', failedConnectionText)} />
      <div
        aria-hidden={true}
        className={classNames('webchat__connectivityStatus', errorNotificationStyleSet + '')}
        dir={direction}
      >
        <ErrorNotificationIcon />
        {failedConnectionText}
      </div>
    </React.Fragment>
  );
};

export default ConnectivityStatusFailedToConnect;
