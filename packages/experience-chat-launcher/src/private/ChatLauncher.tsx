import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import ChatLauncherStylesheet from '../stylesheet/ChatLauncherStylesheet';
import styles from './ChatLauncher.module.css';
import ChatLauncherButton from './private/ChatLauncherButton';

const chatLauncherPropsSchema = pipe(
  object({
    nonce: optional(string())
  }),
  readonly()
);

type ChatLauncherProps = InferInput<typeof chatLauncherPropsSchema>;

function ChatLauncher(props: ChatLauncherProps) {
  const { nonce } = validateProps(chatLauncherPropsSchema, props);
  const classNames = useStyles(styles);

  return (
    <div className={cx('webchat', classNames['webchat-experience-chat-launcher'])}>
      <ChatLauncherStylesheet nonce={nonce} />
      <ChatLauncherButton />
    </div>
  );
}

ChatLauncher.displayName = 'ChatLauncher';

export default memo(ChatLauncher);
