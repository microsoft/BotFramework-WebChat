import { refObject, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { IconButtonPolymiddlewareProxy } from 'botframework-webchat-api/middleware';
import React, { memo } from 'react';
import { boolean, object, pipe, readonly, type InferInput } from 'valibot';

import styles from './ChatLauncherButton.module.css';
import Icon from './Icon';

const chatLauncherButtonPropsSchema = pipe(
  object({
    hasMessage: boolean(),
    popoverTargetRef: refObject<HTMLDivElement>()
  }),
  readonly()
);

type ChatLauncherButtonProps = InferInput<typeof chatLauncherButtonPropsSchema>;

// TODO: [P0] Should we make an IconButton polymiddleware and ChatLauncherButton is based from that?
function ChatLauncherButton(props: ChatLauncherButtonProps) {
  const { hasMessage, popoverTargetRef } = validateProps(chatLauncherButtonPropsSchema, props);

  const classNames = useStyles(styles);

  return (
    <IconButtonPolymiddlewareProxy className={classNames['chat-launcher-button']} popoverTargetRef={popoverTargetRef}>
      {hasMessage ? <Icon appearance="hero" icon="chat-sparkle" /> : <Icon appearance="hero" icon="chat-multiple" />}
    </IconButtonPolymiddlewareProxy>
  );
}

ChatLauncherButton.displayName = 'ChatLauncherButton';

export default memo(ChatLauncherButton);
export { chatLauncherButtonPropsSchema, type ChatLauncherButtonProps };
