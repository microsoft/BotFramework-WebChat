import { refObject, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { forwardRef, memo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import ChatLauncherPopoverDismissButton from './ChatLauncherPopoverDismissButton';
import ChatLauncherPopoverRestartButton from './ChatLauncherPopoverRestartButton';
import styles from './ChatLauncherPopoverTitleBar.module.css';
import ChatLauncherPopoverTitleText from './ChatLauncherPopoverTitleText';

const chatLauncherPopoverTitleBarPropsSchema = pipe(
  object({
    popoverRef: optional(refObject<Element>())
  }),
  readonly()
);

type ChatLauncherPopoverTitleBarProps = InferInput<typeof chatLauncherPopoverTitleBarPropsSchema>;

function ChatLauncherPopoverTitleBar(props: ChatLauncherPopoverTitleBarProps) {
  const { popoverRef } = validateProps(chatLauncherPopoverTitleBarPropsSchema, props);

  const classNames = useStyles(styles);

  return (
    <div className={classNames['chat-launcher-popover__title-bar']}>
      <ChatLauncherPopoverTitleText>{'Contoso agent'}</ChatLauncherPopoverTitleText>
      <ChatLauncherPopoverRestartButton />
      <ChatLauncherPopoverDismissButton popoverRef={popoverRef} />
    </div>
  );
}

ChatLauncherPopoverTitleBar.displayName = 'ChatLauncherPopoverTitleBar';

export default memo(forwardRef(ChatLauncherPopoverTitleBar));
export { chatLauncherPopoverTitleBarPropsSchema, type ChatLauncherPopoverTitleBarProps };
