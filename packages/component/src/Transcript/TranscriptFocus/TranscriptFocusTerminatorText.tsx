import { useStyles } from 'botframework-webchat-styles/react';
import cx from 'classnames';
import React, { forwardRef, type HTMLAttributes } from 'react';

import styles from './TranscriptFocus.module.css';

type TranscriptFocusTerminatorTextProps = HTMLAttributes<HTMLDivElement>;

const TranscriptFocusTerminatorText = forwardRef<HTMLDivElement, TranscriptFocusTerminatorTextProps>(
  ({ className, ...props }, ref) => {
    const classNames = useStyles(styles);

    return <div {...props} className={cx(classNames['transcript-focus-area__terminator-text'], className)} ref={ref} />;
  }
);

TranscriptFocusTerminatorText.displayName = 'TranscriptFocusTerminatorText';

export default TranscriptFocusTerminatorText;
export { type TranscriptFocusTerminatorTextProps };
