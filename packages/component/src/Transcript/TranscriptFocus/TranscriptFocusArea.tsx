import cx from 'classnames';
import React, { forwardRef, type HTMLAttributes } from 'react';
import { useStyles } from 'botframework-webchat-styles/react';

import styles from './TranscriptFocus.module.css';

type TranscriptFocusAreaProps = HTMLAttributes<HTMLDivElement>;

const TranscriptFocusArea = forwardRef<HTMLDivElement, TranscriptFocusAreaProps>(({ className, ...props }, ref) => {
  const classNames = useStyles(styles);

  return <div {...props} className={cx(classNames['transcript-focus-area'], className)} ref={ref} />;
});

TranscriptFocusArea.displayName = 'TranscriptFocusArea';

export default TranscriptFocusArea;
export { type TranscriptFocusAreaProps };
