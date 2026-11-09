import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React from 'react';

import ErrorNotificationIcon from './Assets/ErrorNotificationIcon';
import ScreenReaderText from '../ScreenReaderText';
import { useLiveRegion } from '../providers/LiveRegionTwin';

import styles from './ConnectivityStatus.module.css';

const { useDirection, useLocalizer } = hooks;

const ConnectivityStatusFailedToConnect = () => {
  const classNames = useStyles(styles, webChatPrefixedClassName);
  const [direction] = useDirection();
  const localize = useLocalizer();

  const failedConnectionText = localize('CONNECTIVITY_STATUS_ALT_FATAL');

  const alt = localize('CONNECTIVITY_STATUS_ALT', failedConnectionText);

  useLiveRegion(() => alt, [alt]);

  return (
    <React.Fragment>
      <ScreenReaderText text={alt} />
      <div
        aria-hidden={true}
        className={cx(classNames['connectivityStatus'], classNames['connectivityStatus--error'])}
        dir={direction}
      >
        <ErrorNotificationIcon />
        {failedConnectionText}
      </div>
    </React.Fragment>
  );
};

export default ConnectivityStatusFailedToConnect;
