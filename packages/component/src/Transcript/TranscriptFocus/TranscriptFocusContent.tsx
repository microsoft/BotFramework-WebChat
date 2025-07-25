import cx from 'classnames';
import React, { forwardRef, type HTMLAttributes } from 'react';
import { useStyles } from 'botframework-webchat-styles/react';

import styles from './TranscriptFocus.module.css';

type TranscriptFocusContentProps = HTMLAttributes<HTMLDivElement> &
  Readonly<{
    tag?: React.ElementType;
    focused?: boolean;
  }>;

const TranscriptFocusContent = forwardRef<HTMLDivElement, TranscriptFocusContentProps>(
  ({ className, tag: Tag = 'div', focused = false, ...props }, ref) => {
    const classNames = useStyles(styles);

    return (
      <Tag
        {...props}
        className={cx(
          classNames['transcript-focus-area__content'],
          { [classNames['transcript-focus-area__content--focused']]: focused },
          className
        )}
        ref={ref}
      />
    );
  }
);

TranscriptFocusContent.displayName = 'TranscriptFocusContent';

export default TranscriptFocusContent;
export { type TranscriptFocusContentProps };
