import classNames from 'classnames';
import React from 'react';

import ErrorNotificationIcon from './Assets/ErrorNotificationIcon';
import ScreenReaderText from '../ScreenReaderText';
import useDirection from '../hooks/useDirection';
import useLocalizer from '../hooks/useLocalizer';
import useStyleSet from '../hooks/useStyleSet';

const ConnectivityStatusJavaScriptError = () => {
  const [{ errorNotification: errorNotificationStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const localize = useLocalizer();

  const renderErrorNotificationText = localize('CONNECTIVITY_STATUS_ALT_RENDER_ERROR');

  return (
    <React.Fragment>
      <ScreenReaderText text={localize('CONNECTIVITY_STATUS_ALT', renderErrorNotificationText)} />
      <div
        aria-hidden={true}
        className={classNames('webchat__connectivityStatus', errorNotificationStyleSet + '')}
        dir={direction}
      >
        <ErrorNotificationIcon />
        {renderErrorNotificationText}
      </div>
    </React.Fragment>
  );
};

export default ConnectivityStatusJavaScriptError;
