import { useStyles } from 'botframework-webchat-styles/react';
import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import cx from 'classnames';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import ScreenReaderText from '../ScreenReaderText';
import Bubble from './Bubble';

import styles from './StackedLayout.module.css';

const attachmentRowPropsSchema = pipe(
  object({
    attachedAlt: string(),
    children: optional(reactNode()),
    fromUser: boolean(),
    hasAvatar: boolean(),
    hasNub: boolean(),
    showBubble: optional(boolean())
  }),
  readonly()
);

type AttachmentRowProps = InferInput<typeof attachmentRowPropsSchema>;

function AttachmentRow(props: AttachmentRowProps) {
  const {
    attachedAlt,
    children,
    fromUser,
    hasAvatar,
    hasNub,
    showBubble = true
  } = validateProps(attachmentRowPropsSchema, props);
  const classNames = useStyles(styles);

  return (
    <div aria-roledescription="attachment" className={classNames['stacked-layout__attachment-row']} role="group">
      <ScreenReaderText text={attachedAlt} />
      {showBubble ? (
        <Bubble
          className={classNames['stacked-layout__attachment']}
          fromUser={fromUser}
          nub={hasAvatar || hasNub ? 'hidden' : false}
        >
          {children}
        </Bubble>
      ) : (
        <div className={cx(classNames['stacked-layout__attachment'])}>{children}</div>
      )}
    </div>
  );
}

export default memo(AttachmentRow);
export { attachmentRowPropsSchema, type AttachmentRowProps };
