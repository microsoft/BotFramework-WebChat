import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { forwardRef, type HTMLAttributes } from 'react';

import styles from './TranscriptFocus.module.css';

type TranscriptFocusContentProps = HTMLAttributes<HTMLDivElement> & {
  focused?: boolean;
  tag?: string | React.JSXElementConstructor<any>;
};

const TranscriptFocusContent = forwardRef<HTMLDivElement, TranscriptFocusContentProps>(
  ({ className, focused, tag: Tag = 'div', ...props }, ref) => {
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
