import { reactNode, validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string } from 'valibot';

import ScreenReaderText from '../ScreenReaderText';
import Bubble from './Bubble';

import styles from './StackedLayout.module.css';

const { useLocalizer } = hooks;

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

type AttachmentRowProps = InferReactProps<typeof attachmentRowPropsSchema>;

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
  const localize = useLocalizer();

  return (
    <div
      aria-roledescription={localize('ACTIVITY_ATTACHMENT_ARIA_ROLE_ALT')}
      className={classNames['stacked-layout__attachment-row']}
      role="group"
    >
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
