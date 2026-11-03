import { testIds } from 'botframework-webchat';
import cx from 'classnames';
import React, { memo } from 'react';

import { useStyles } from '../../styles';
import SlidingDots from '../assets/SlidingDots';
import styles from './SlidingDotsTypingIndicator.module.css';

function SlidingDotsTypingIndicator() {
  const classNames = useStyles(styles);

  return (
    <div className={classNames['sliding-dots-typing-indicator']} data-testid={testIds.typingIndicator}>
      <SlidingDots className={cx(classNames['sliding-dots-typing-indicator__image'])} />
    </div>
  );
}

export default memo(SlidingDotsTypingIndicator);
