/* eslint-disable react/require-default-props */
import { useStyles } from 'botframework-webchat-styles/react';
import cx from 'classnames';
import React, { forwardRef, type HTMLAttributes } from 'react';

import styles from './TranscriptFocus.module.css';

type TranscriptFocusIndicatorProps = HTMLAttributes<HTMLDivElement> &
  Readonly<{
    type?: 'content' | 'transcript';
  }>;

const TranscriptFocusIndicator = forwardRef<HTMLDivElement, TranscriptFocusIndicatorProps>(
  ({ className, type = 'content', ...props }, ref) => {
    const classNames = useStyles(styles);

    const indicatorClass =
      type === 'content'
        ? classNames['transcript-focus-area__indicator']
        : classNames['transcript-focus-area__transcript-indicator'];

    return <div {...props} className={cx(indicatorClass, className)} ref={ref} />;
  }
);

TranscriptFocusIndicator.displayName = 'TranscriptFocusIndicator';

export default TranscriptFocusIndicator;
export { type TranscriptFocusIndicatorProps };
