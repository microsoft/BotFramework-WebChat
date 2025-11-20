import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { forwardRef, memo, type HTMLAttributes } from 'react';

import styles from './TranscriptFocus.module.css';

type TranscriptActivityListProps = HTMLAttributes<HTMLDivElement>;

const TranscriptActivityList = forwardRef<HTMLDivElement, TranscriptActivityListProps>(
  ({ className, ...props }, ref) => {
    const classNames = useStyles(styles);

    return (
      <section {...props} className={cx(classNames['transcript-focus-area__activity-list'], className)} ref={ref} />
    );
  }
);

TranscriptActivityList.displayName = 'TranscriptActivityList';

export default memo(TranscriptActivityList);
export { type TranscriptActivityListProps };
