import { useStyles } from 'botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo } from 'react';

import { useVariantClassName } from '../../styles';
import testIds from '../../testIds';
import SlidingDots from '../assets/SlidingDots';
import styles from './SlidingDotsTypingIndicator.module.css';

function SlidingDotsTypingIndicator() {
  const classNames = useStyles(styles);
  const variantClassName = useVariantClassName(classNames);

  return (
    <div className={cx(classNames['sliding-dots-typing-indicator'], variantClassName)} data-testid={testIds.typingIndicator}>
      <SlidingDots className={cx(classNames['sliding-dots-typing-indicator__image'])} />
    </div>
  );
}

export default memo(SlidingDotsTypingIndicator);
