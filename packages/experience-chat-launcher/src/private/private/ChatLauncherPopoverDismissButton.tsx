import { reactNode, refObject, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useEffect, useRef } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

const chatLauncherModalDismissButtonPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    popoverRef: optional(refObject<Element>())
  }),
  readonly()
);

type ChatLauncherModalDismissButtonProps = InferInput<typeof chatLauncherModalDismissButtonPropsSchema>;

function ChatLauncherModalDismissButton(props: ChatLauncherModalDismissButtonProps) {
  const { children, popoverRef } = validateProps(chatLauncherModalDismissButtonPropsSchema, props);

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const { current: button } = buttonRef;

    if (button) {
      button.popoverTargetAction = 'hide';

      // At the time when `popoverTargetElement` is being set, the element referenced by `popoverRef` may not have `popover` attribute yet.
      button.popoverTargetElement = popoverRef?.current || null;
    }
  }, [buttonRef, popoverRef]);

  return (
    <button ref={buttonRef} type="button">
      {children}
    </button>
  );
}

ChatLauncherModalDismissButton.displayName = 'ChatLauncherModalDismissButton';

export default memo(ChatLauncherModalDismissButton);
