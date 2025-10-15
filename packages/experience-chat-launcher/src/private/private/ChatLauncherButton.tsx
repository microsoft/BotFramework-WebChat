import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo } from 'react';
import { boolean, object, pipe, readonly, type InferInput } from 'valibot';

import styles from './ChatLauncherButton.module.css';

const chatLauncherButtonPropsSchema = pipe(
  object({
    hasMessage: boolean()
  }),
  readonly()
);

type ChatLauncherButtonProps = InferInput<typeof chatLauncherButtonPropsSchema>;

function ChatLauncherButton(props: ChatLauncherButtonProps) {
  const { hasMessage } = validateProps(chatLauncherButtonPropsSchema, props);
  const classNames = useStyles(styles);

  return (
    <button className={classNames['chat-launcher-button']} type="button">
      {hasMessage ? '⭐' : '💬'}
    </button>
  );
}

ChatLauncherButton.displayName = 'ChatLauncherButton';

export default memo(ChatLauncherButton);
export { chatLauncherButtonPropsSchema, type ChatLauncherButtonProps };
