import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { forwardRef, ReactNode, type HTMLAttributes } from 'react';

import styles from './TranscriptFocus.module.css';
import TranscriptFocusIndicator from './TranscriptFocusIndicator';

type TranscriptFocusContentProps = HTMLAttributes<HTMLDivElement> &
  Readonly<{
    activeDescendant?: ReactNode | undefined;
    tag?: React.ElementType;
    focused?: boolean;
  }>;

const TranscriptFocusContent = forwardRef<HTMLDivElement, TranscriptFocusContentProps>(
  ({ activeDescendant, className, children, tag: Tag = 'div', focused = false, ...props }, ref) => {
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
      >
        {activeDescendant}
        <div className={classNames['transcript-focus-area__content-root']}>{children}</div>
        <TranscriptFocusIndicator />
      </Tag>
    );
  }
);

TranscriptFocusContent.displayName = 'TranscriptFocusContent';

export default TranscriptFocusContent;
export { type TranscriptFocusContentProps };
