import { useStyles } from 'botframework-webchat-styles/react';
import cx from 'classnames';
import React, { forwardRef, type HTMLAttributes } from 'react';

import styles from './TranscriptFocus.module.css';
import { hooks } from 'botframework-webchat-api';
import useUniqueId from '../../hooks/internal/useUniqueId';

type TranscriptFocusTerminatorProps = HTMLAttributes<HTMLDivElement>;

const { useLocalizer } = hooks;

const TranscriptFocusTerminator = forwardRef<HTMLDivElement, TranscriptFocusTerminatorProps>(
  ({ className, ...props }, ref) => {
    const classNames = useStyles(styles);
    const localize = useLocalizer();
    const terminatorText = localize('TRANSCRIPT_TERMINATOR_TEXT');
    const terminatorLabelId = useUniqueId('webchat__basic-transcript__terminator-label');

    return (
      <div
        {...props}
        aria-labelledby={terminatorLabelId}
        className={cx(classNames['transcript-focus-area__terminator'], className)}
        ref={ref}
      >
        <div className={cx(classNames['transcript-focus-area__terminator-body'])}>
          {/* `id` is required for `aria-labelledby` */}
          {/* eslint-disable-next-line react/forbid-dom-props */}
          <div className={cx(classNames['transcript-focus-area__terminator-text'])} id={terminatorLabelId}>
            {terminatorText}
          </div>
        </div>
      </div>
    );
  }
);

TranscriptFocusTerminator.displayName = 'TranscriptFocusTerminator';

export default TranscriptFocusTerminator;
export { type TranscriptFocusTerminatorProps };
