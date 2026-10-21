import { hooks } from 'botframework-webchat-api';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import classNames from 'classnames';
import React, { Fragment, memo } from 'react';
import { boolean, object, optional, pipe, readonly, type InferInput } from 'valibot';

import useStyleSet from '../hooks/useStyleSet';
import { useLiveRegion } from '../providers/LiveRegionTwin';
import ScreenReaderText from '../ScreenReaderText';
import SpinnerAnimation from './Assets/SpinnerAnimation';
import WarningNotificationIcon from './Assets/WarningNotificationIcon';

const { useDirection, useLocalizer } = hooks;

const connectivityStatusConnectingPropsSchema = pipe(
  object({
    reconnect: optional(boolean()),
    slow: optional(boolean())
  }),
  readonly()
);

type ConnectivityStatusConnectingProps = InferInput<typeof connectivityStatusConnectingPropsSchema>;

function ConnectivityStatusConnecting(props: ConnectivityStatusConnectingProps) {
  const { reconnect = false, slow = false } = validateProps(connectivityStatusConnectingPropsSchema, props);

  const [
    { connectivityNotification: connectivityNotificationStyleSet, warningNotification: warningNotificationStyleSet }
  ] = useStyleSet();
  const [direction] = useDirection();
  const localize = useLocalizer();

  const initialConnectionText = localize('CONNECTIVITY_STATUS_ALT_CONNECTING');
  const interruptedConnectionText = localize('CONNECTIVITY_STATUS_ALT_RECONNECTING');
  const slowConnectionText = localize('CONNECTIVITY_STATUS_ALT_SLOW_CONNECTION');

  const alt = localize(
    'CONNECTIVITY_STATUS_ALT',
    slow ? slowConnectionText : reconnect ? interruptedConnectionText : initialConnectionText
  );

  // Announces "Reconnecting…" and "Slow connection", but not "Connecting…" while Web Chat starts.
  useLiveRegion(() => (reconnect || slow) && alt, [alt, reconnect, slow]);

  return slow ? (
    <Fragment>
      <ScreenReaderText text={alt} />
      <div
        aria-hidden={true}
        className={classNames('webchat__connectivityStatus', warningNotificationStyleSet + '')}
        dir={direction}
      >
        <WarningNotificationIcon />
        {slowConnectionText}
      </div>
    </Fragment>
  ) : (
    <Fragment>
      <ScreenReaderText text={alt} />
      <div
        aria-hidden={true}
        className={classNames('webchat__connectivityStatus', connectivityNotificationStyleSet + '')}
        dir={direction}
      >
        <SpinnerAnimation />
        {reconnect ? interruptedConnectionText : initialConnectionText}
      </div>
    </Fragment>
  );
}

export default memo(ConnectivityStatusConnecting);
export { connectivityStatusConnectingPropsSchema, type ConnectivityStatusConnectingProps };
