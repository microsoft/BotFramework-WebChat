import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React from 'react';

import styles from '../ConnectivityStatus.module.css';

const { useDirection } = hooks;

const SpinnerAnimation = () => {
  const classNames = useStyles(styles, webChatPrefixedClassName);
  const [direction] = useDirection();

  return <div className={cx(classNames['spinnerAnimation'], direction === 'rtl' && 'webchat__spinner--rtl')} />;
};

export default SpinnerAnimation;
