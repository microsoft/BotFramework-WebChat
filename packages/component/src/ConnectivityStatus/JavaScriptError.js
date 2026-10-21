import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React from 'react';

import ErrorNotificationIcon from './Assets/ErrorNotificationIcon';
import ScreenReaderText from '../ScreenReaderText';
import useStyleSet from '../hooks/useStyleSet';
import { useLiveRegion } from '../providers/LiveRegionTwin';

const { useDirection, useLocalizer } = hooks;

const ConnectivityStatusJavaScriptError = () => {
  const [{ errorNotification: errorNotificationStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const localize = useLocalizer();

  const renderErrorNotificationText = localize('CONNECTIVITY_STATUS_ALT_RENDER_ERROR');

  const alt = localize('CONNECTIVITY_STATUS_ALT', renderErrorNotificationText);

  useLiveRegion(() => alt, [alt]);

  return (
    <React.Fragment>
      <ScreenReaderText text={alt} />
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
