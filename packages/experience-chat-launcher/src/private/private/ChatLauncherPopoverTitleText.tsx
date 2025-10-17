import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import styles from './ChatLauncherPopoverTitleText.module.css';

const chatLauncherPopoverTitleTextPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type ChatLauncherPopoverTitleTextProps = InferInput<typeof chatLauncherPopoverTitleTextPropsSchema>;

function ChatLauncherPopoverTitleText(props: ChatLauncherPopoverTitleTextProps) {
  const { children } = validateProps(chatLauncherPopoverTitleTextPropsSchema, props);

  const classNames = useStyles(styles);

  return <div className={classNames['chat-launcher-popover__title-text']}>{children}</div>;
}

ChatLauncherPopoverTitleText.displayName = 'ChatLauncherPopoverTitleText';

export default memo(ChatLauncherPopoverTitleText);
export { chatLauncherPopoverTitleTextPropsSchema, type ChatLauncherPopoverTitleTextProps };
