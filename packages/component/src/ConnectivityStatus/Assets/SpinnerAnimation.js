import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import React from 'react';

import styles from '../ConnectivityStatus.module.css';

const SpinnerAnimation = () => {
  const classNames = useStyles(styles, webChatPrefixedClassName);

  return <div className={classNames['spinnerAnimation']} />;
};

export default SpinnerAnimation;
