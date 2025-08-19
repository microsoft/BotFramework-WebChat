import { useStyles } from 'botframework-webchat-styles/react';
import cx from 'classnames';
import React, { forwardRef, type HTMLAttributes } from 'react';

import styles from './TranscriptFocus.module.css';

type TranscriptFocusContentActiveDescendantProps = HTMLAttributes<HTMLDivElement>;

const TranscriptFocusContentActiveDescendant = forwardRef<HTMLDivElement, TranscriptFocusContentActiveDescendantProps>(
  ({ className, ...props }, ref) => {
    const classNames = useStyles(styles);

    return (
      <div
        {...props}
        className={cx(classNames['transcript-focus-area__content-active-descendant'], className)}
        ref={ref}
      />
    );
  }
);

TranscriptFocusContentActiveDescendant.displayName = 'TranscriptFocusContentActiveDescendant';

export default TranscriptFocusContentActiveDescendant;
export { type TranscriptFocusContentActiveDescendantProps };
