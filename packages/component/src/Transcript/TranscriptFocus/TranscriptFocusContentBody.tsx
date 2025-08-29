import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { forwardRef, type HTMLAttributes } from 'react';

import styles from './TranscriptFocus.module.css';

type TranscriptFocusContentBodyProps = HTMLAttributes<HTMLDivElement>;

const TranscriptFocusContentBody = forwardRef<HTMLDivElement, TranscriptFocusContentBodyProps>(
  ({ className, ...props }, ref) => {
    const classNames = useStyles(styles);

    return <div {...props} className={cx(classNames['transcript-focus-area__content-body'], className)} ref={ref} />;
  }
);

TranscriptFocusContentBody.displayName = 'TranscriptFocusContentBody';

export default TranscriptFocusContentBody;
export { type TranscriptFocusContentBodyProps };
