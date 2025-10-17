import { PopoverPolymiddlewareProxy } from 'botframework-webchat-api/middleware';
import mergeRefs from 'merge-refs';
import React, { forwardRef, memo, useRef, type ForwardedRef } from 'react';
import { object, pipe, readonly, type InferInput } from 'valibot';

import ChatLauncherPopoverTitleBar from './ChatLauncherPopoverTitleBar';

const chatLauncherPopoverPropsSchema = pipe(object({}), readonly());

type ChatLauncherPopoverProps = InferInput<typeof chatLauncherPopoverPropsSchema>;

function ChatLauncherPopover(_: ChatLauncherPopoverProps, ref: ForwardedRef<Element>) {
  const popoverRef = useRef<Element>(null);

  return (
    // TODO: [P2] Is it correct to force-cast ref to HTMLDivElement?
    <PopoverPolymiddlewareProxy popover="manual" ref={mergeRefs(popoverRef, ref)} type="nonmodal">
      <ChatLauncherPopoverTitleBar popoverRef={popoverRef} />
    </PopoverPolymiddlewareProxy>
  );
}

ChatLauncherPopover.displayName = 'ChatLauncherPopover';

export default memo(forwardRef(ChatLauncherPopover));
export { chatLauncherPopoverPropsSchema, type ChatLauncherPopoverProps };
