import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { forwardRef, type HTMLAttributes } from 'react';

import TranscriptFocusIndicator from './TranscriptFocusIndicator';

import styles from './TranscriptFocus.module.css';

type TranscriptFocusAreaProps = HTMLAttributes<HTMLDivElement>;

const TranscriptFocusArea = forwardRef<HTMLDivElement, TranscriptFocusAreaProps>(
  ({ className, children, ...props }, ref) => {
    const classNames = useStyles(styles);

    return (
      <div {...props} className={cx(classNames['transcript-focus-area'], className)} ref={ref}>
        <div className={classNames['transcript-focus-area__root']}>{children}</div>
        <TranscriptFocusIndicator type="transcript" />
      </div>
    );
  }
);

TranscriptFocusArea.displayName = 'TranscriptFocusArea';

export default TranscriptFocusArea;
export { type TranscriptFocusAreaProps };
