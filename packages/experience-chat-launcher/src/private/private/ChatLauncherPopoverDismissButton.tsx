import { refObject, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { ButtonPolymiddlewareProxy } from 'botframework-webchat-api/middleware';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import Icon from './Icon';

const chatLauncherPopoverDismissButtonPropsSchema = pipe(
  object({
    popoverRef: optional(refObject<Element>())
  }),
  readonly()
);

type ChatLauncherPopoverDismissButtonProps = InferInput<typeof chatLauncherPopoverDismissButtonPropsSchema>;

function ChatLauncherPopoverDismissButton(props: ChatLauncherPopoverDismissButtonProps) {
  const { popoverRef } = validateProps(chatLauncherPopoverDismissButtonPropsSchema, props);

  return (
    <ButtonPolymiddlewareProxy appearance="flat" popoverTargetAction="hide" popoverTargetRef={popoverRef}>
      <Icon appearance="button" icon="dismiss" />
    </ButtonPolymiddlewareProxy>
  );
}

ChatLauncherPopoverDismissButton.displayName = 'ChatLauncherPopoverDismissButton';

export default memo(ChatLauncherPopoverDismissButton);
export { chatLauncherPopoverDismissButtonPropsSchema, type ChatLauncherPopoverDismissButtonProps };
