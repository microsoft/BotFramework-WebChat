import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { Fragment, memo } from 'react';
import { boolean, object, optional, pipe, readonly } from 'valibot';

import { useLiveRegion } from '../providers/LiveRegionTwin';
import ScreenReaderText from '../ScreenReaderText';
import SpinnerAnimation from './Assets/SpinnerAnimation';
import WarningNotificationIcon from './Assets/WarningNotificationIcon';

import styles from './ConnectivityStatus.module.css';

const { useDirection, useLocalizer } = hooks;

const connectivityStatusConnectingPropsSchema = pipe(
  object({
    reconnect: optional(boolean()),
    slow: optional(boolean())
  }),
  readonly()
);

type ConnectivityStatusConnectingProps = InferReactProps<typeof connectivityStatusConnectingPropsSchema>;

function ConnectivityStatusConnecting(props: ConnectivityStatusConnectingProps) {
  const { reconnect = false, slow = false } = validateProps(connectivityStatusConnectingPropsSchema, props);

  const classNames = useStyles(styles, webChatPrefixedClassName);
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
        className={cx(classNames['connectivityStatus'], classNames['connectivityStatus--warning'])}
        dir={direction}
      >
        <WarningNotificationIcon />
        {slowConnectionText}
      </div>
    </Fragment>
  ) : (
    <Fragment>
      <ScreenReaderText text={alt} />
      <div aria-hidden={true} className={classNames['connectivityStatus']} dir={direction}>
        <SpinnerAnimation />
        {reconnect ? interruptedConnectionText : initialConnectionText}
      </div>
    </Fragment>
  );
}

export default memo(ConnectivityStatusConnecting);
export { connectivityStatusConnectingPropsSchema, type ConnectivityStatusConnectingProps };
