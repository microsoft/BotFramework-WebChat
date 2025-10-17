import { refObject, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { ButtonPolymiddlewareProxy } from 'botframework-webchat-api/middleware';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import Icon from './Icon';

const chatLauncherModalDismissButtonPropsSchema = pipe(
  object({
    popoverRef: optional(refObject<Element>())
  }),
  readonly()
);

type ChatLauncherModalDismissButtonProps = InferInput<typeof chatLauncherModalDismissButtonPropsSchema>;

function ChatLauncherModalDismissButton(props: ChatLauncherModalDismissButtonProps) {
  const { popoverRef } = validateProps(chatLauncherModalDismissButtonPropsSchema, props);

  return (
    <ButtonPolymiddlewareProxy appearance="flat" popoverTargetAction="hide" popoverTargetRef={popoverRef}>
      <Icon appearance="text" icon="dismiss" />
    </ButtonPolymiddlewareProxy>
  );
}

ChatLauncherModalDismissButton.displayName = 'ChatLauncherModalDismissButton';

export default memo(ChatLauncherModalDismissButton);
