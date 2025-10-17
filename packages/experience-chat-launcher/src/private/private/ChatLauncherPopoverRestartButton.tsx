import { ButtonPolymiddlewareProxy } from 'botframework-webchat-api/middleware';
import React, { memo } from 'react';
import { object, pipe, readonly, type InferInput } from 'valibot';

import Icon from './Icon';

const chatLauncherPopoverRestartButtonPropsSchema = pipe(object({}), readonly());

type ChatLauncherPopoverRestartButtonProps = InferInput<typeof chatLauncherPopoverRestartButtonPropsSchema>;

function ChatLauncherPopoverRestartButton(_: ChatLauncherPopoverRestartButtonProps) {
  return (
    <ButtonPolymiddlewareProxy appearance="flat">
      <Icon appearance="button" icon="arrow-clockwise" />
    </ButtonPolymiddlewareProxy>
  );
}

ChatLauncherPopoverRestartButton.displayName = 'ChatLauncherPopoverRestartButton';

export default memo(ChatLauncherPopoverRestartButton);
export { chatLauncherPopoverRestartButtonPropsSchema, type ChatLauncherPopoverRestartButtonProps };
