import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { forwardRef, type HTMLAttributes } from 'react';

import styles from './TranscriptFocus.module.css';

type TranscriptFocusContentOverlayProps = HTMLAttributes<HTMLDivElement>;

const TranscriptFocusContentOverlay = forwardRef<HTMLDivElement, TranscriptFocusContentOverlayProps>(
  ({ className, ...props }, ref) => {
    const classNames = useStyles(styles);

    return (
      <div
        {...props}
        className={cx(
          classNames['transcript-focus-area__content-overlay'],
          className
        )}
        ref={ref}
      />
    );
  }
);

TranscriptFocusContentOverlay.displayName = 'TranscriptFocusContentOverlay';

export default TranscriptFocusContentOverlay;
export { type TranscriptFocusContentOverlayProps };
