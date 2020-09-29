import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

// TODO: No /lib/
import useForceRender from 'botframework-webchat-api/lib/hooks/internal/useForceRender';
import useTimer from 'botframework-webchat-api/lib/hooks/internal/useTimer';

import ScreenReaderText from '../ScreenReaderText';
import SpinnerAnimation from './Assets/SpinnerAnimation';
import useStyleSet from '../hooks/useStyleSet';
import WarningNotificationIcon from './Assets/WarningNotificationIcon';

const { useDirection, useLocalizer, useStyleOptions } = hooks;

const ConnectivityStatusConnecting = ({ reconnect }) => {
  const [{ slowConnectionAfter }] = useStyleOptions();
  const [
    { connectivityNotification: connectivityNotificationStyleSet, warningNotification: warningNotificationStyleSet }
  ] = useStyleSet();
  const [direction] = useDirection();
  const [initialRenderAt] = useState(() => Date.now());
  const forceRender = useForceRender();
  const localize = useLocalizer();

  const initialConnectionText = localize('CONNECTIVITY_STATUS_ALT_CONNECTING');
  const interruptedConnectionText = localize('CONNECTIVITY_STATUS_ALT_RECONNECTING');
  const slowConnectionText = localize('CONNECTIVITY_STATUS_ALT_SLOW_CONNECTION');

  useTimer(initialRenderAt + slowConnectionAfter, forceRender);

  const now = Date.now();
  const slow = now >= initialRenderAt + slowConnectionAfter;

  return slow ? (
    <React.Fragment>
      <ScreenReaderText text={localize('CONNECTIVITY_STATUS_ALT', slowConnectionText)} />
      <div
        aria-hidden={true}
        className={classNames('webchat__connectivityStatus', warningNotificationStyleSet + '')}
        dir={direction}
      >
        <WarningNotificationIcon />
        {slowConnectionText}
      </div>
    </React.Fragment>
  ) : (
    <React.Fragment>
      <ScreenReaderText
        text={localize('CONNECTIVITY_STATUS_ALT', reconnect ? interruptedConnectionText : initialConnectionText)}
      />
      <div
        aria-hidden={true}
        className={classNames('webchat__connectivityStatus', connectivityNotificationStyleSet + '')}
        dir={direction}
      >
        <SpinnerAnimation />
        {reconnect ? interruptedConnectionText : initialConnectionText}
      </div>
    </React.Fragment>
  );
};

ConnectivityStatusConnecting.defaultProps = {
  reconnect: false
};

ConnectivityStatusConnecting.propTypes = {
  reconnect: PropTypes.bool
};

export default ConnectivityStatusConnecting;
