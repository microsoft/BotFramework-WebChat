import { ButtonPolymiddlewareProxy } from 'botframework-webchat-api/middleware';
import React, { memo } from 'react';
import { object, pipe, readonly, type InferInput } from 'valibot';

import Icon from '../Icon';

const restartButtonPropsSchema = pipe(object({}), readonly());

type RestartButtonProps = InferInput<typeof restartButtonPropsSchema>;

function RestartButton(_: RestartButtonProps) {
  return (
    <ButtonPolymiddlewareProxy appearance="flat">
      <Icon appearance="button" icon="arrow-clockwise" />
    </ButtonPolymiddlewareProxy>
  );
}

RestartButton.displayName = 'ChatLauncherPopover/RestartButton';

export default memo(RestartButton);
export { restartButtonPropsSchema, type RestartButtonProps };
