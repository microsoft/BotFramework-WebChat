import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

import SpinnerAnimation from './Assets/SpinnerAnimation';
import useForceRender from '../hooks/internal/useForceRender';
import useQueueStaticElement from '../providers/LiveRegionTwin/useQueueStaticElement';
import useStyleSet from '../hooks/useStyleSet';
import useTimer from '../hooks/internal/useTimer';
import WarningNotificationIcon from './Assets/WarningNotificationIcon';

import type { FC } from 'react';

const { useDirection, useLocalizer, useStyleOptions } = hooks;

type Props = {
  reconnect?: boolean;
};

const ConnectivityStatusConnecting: FC<Props> = ({ reconnect }) => {
  const [{ slowConnectionAfter }] = useStyleOptions();
  const [
    { connectivityNotification: connectivityNotificationStyleSet, warningNotification: warningNotificationStyleSet }
  ] = useStyleSet();
  const [direction] = useDirection();
  const [initialRenderAt] = useState(() => Date.now());
  const forceRender = useForceRender();
  const localize = useLocalizer();
  const queueStaticElement = useQueueStaticElement();

  const initialConnectionText = localize('CONNECTIVITY_STATUS_ALT_CONNECTING');
  const interruptedConnectionText = localize('CONNECTIVITY_STATUS_ALT_RECONNECTING');
  const slowConnectionText = localize('CONNECTIVITY_STATUS_ALT_SLOW_CONNECTION');

  useTimer(initialRenderAt + slowConnectionAfter, forceRender);

  const now = Date.now();
  const slow = now >= initialRenderAt + slowConnectionAfter;

  const connectingAlt = localize(
    'CONNECTIVITY_STATUS_ALT',
    slow ? slowConnectionText : reconnect ? interruptedConnectionText : initialConnectionText
  );

  useMemo(() => queueStaticElement(connectingAlt), [connectingAlt, queueStaticElement]);

  return slow ? (
    <div
      aria-hidden={true}
      className={classNames('webchat__connectivityStatus', warningNotificationStyleSet + '')}
      dir={direction}
    >
      <WarningNotificationIcon />
      {slowConnectionText}
    </div>
  ) : (
    <div
      aria-hidden={true}
      className={classNames('webchat__connectivityStatus', connectivityNotificationStyleSet + '')}
      dir={direction}
    >
      <SpinnerAnimation />
      {reconnect ? interruptedConnectionText : initialConnectionText}
    </div>
  );
};

ConnectivityStatusConnecting.defaultProps = {
  reconnect: false
};

ConnectivityStatusConnecting.propTypes = {
  reconnect: PropTypes.bool
};

export default ConnectivityStatusConnecting;
