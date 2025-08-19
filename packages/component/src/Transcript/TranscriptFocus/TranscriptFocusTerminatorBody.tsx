import { useStyles } from 'botframework-webchat-styles/react';
import cx from 'classnames';
import React, { forwardRef, type HTMLAttributes } from 'react';

import styles from './TranscriptFocus.module.css';

type TranscriptFocusTerminatorBodyProps = HTMLAttributes<HTMLDivElement>;

const TranscriptFocusTerminatorBody = forwardRef<HTMLDivElement, TranscriptFocusTerminatorBodyProps>(
  ({ className, ...props }, ref) => {
    const classNames = useStyles(styles);

    return <div {...props} className={cx(classNames['transcript-focus-area__terminator-body'], className)} ref={ref} />;
  }
);

TranscriptFocusTerminatorBody.displayName = 'TranscriptFocusTerminatorBody';

export default TranscriptFocusTerminatorBody;
export { type TranscriptFocusTerminatorBodyProps };
