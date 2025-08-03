import { hooks } from 'botframework-webchat-api';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import classNames from 'classnames';
import React, { Fragment, memo, useState } from 'react';
import { boolean, object, optional, pipe, readonly, type InferInput } from 'valibot';

import useForceRender from '../hooks/internal/useForceRender';
import useTimer from '../hooks/internal/useTimer';
import useStyleSet from '../hooks/useStyleSet';
import ScreenReaderText from '../ScreenReaderText';
import SpinnerAnimation from './Assets/SpinnerAnimation';
import WarningNotificationIcon from './Assets/WarningNotificationIcon';

const { useDirection, useLocalizer, usePonyfill, useStyleOptions } = hooks;

const connectivityStatusConnectingPropsSchema = pipe(
  object({
    reconnect: optional(boolean())
  }),
  readonly()
);

type ConnectivityStatusConnectingProps = InferInput<typeof connectivityStatusConnectingPropsSchema>;

function ConnectivityStatusConnecting(props: ConnectivityStatusConnectingProps) {
  const { reconnect = false } = validateProps(connectivityStatusConnectingPropsSchema, props);

  const [{ Date }] = usePonyfill();
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
    <Fragment>
      <ScreenReaderText text={localize('CONNECTIVITY_STATUS_ALT', slowConnectionText)} />
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
    </Fragment>
  );
}

export default memo(ConnectivityStatusConnecting);
export { connectivityStatusConnectingPropsSchema, type ConnectivityStatusConnectingProps };
