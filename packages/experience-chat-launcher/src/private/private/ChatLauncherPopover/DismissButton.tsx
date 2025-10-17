import { refObject, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { ButtonPolymiddlewareProxy } from 'botframework-webchat-api/middleware';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import Icon from '../Icon';

const dismissButtonPropsSchema = pipe(
  object({
    popoverRef: optional(refObject<Element>())
  }),
  readonly()
);

type DismissButtonProps = InferInput<typeof dismissButtonPropsSchema>;

function DismissButton(props: DismissButtonProps) {
  const { popoverRef } = validateProps(dismissButtonPropsSchema, props);

  return (
    <ButtonPolymiddlewareProxy appearance="flat" popoverTargetAction="hide" popoverTargetRef={popoverRef}>
      <Icon appearance="button" icon="dismiss" />
    </ButtonPolymiddlewareProxy>
  );
}

DismissButton.displayName = 'ChatLauncherPopover/DismissButton';

export default memo(DismissButton);
export { dismissButtonPropsSchema, type DismissButtonProps };
