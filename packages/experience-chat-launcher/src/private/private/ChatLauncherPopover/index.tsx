import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { PopoverPolymiddlewareProxy } from 'botframework-webchat-api/middleware';
import { BasicWebChat } from 'botframework-webchat-component/component';
import mergeRefs from 'merge-refs';
import React, { forwardRef, memo, useRef, type ForwardedRef } from 'react';
import { object, pipe, readonly, type InferInput } from 'valibot';

import TitleBar from './TitleBar';
import styles from './index.module.css';

const chatLauncherPopoverPropsSchema = pipe(object({}), readonly());

type ChatLauncherPopoverProps = InferInput<typeof chatLauncherPopoverPropsSchema>;

function ChatLauncherPopover(_: ChatLauncherPopoverProps, ref: ForwardedRef<Element>) {
  const popoverRef = useRef<Element>(null);

  const classNames = useStyles(styles);

  return (
    // TODO: [P2] Is it correct to force-cast ref to HTMLDivElement?
    <PopoverPolymiddlewareProxy
      className={classNames['chat-launcher-popover']}
      popover="manual"
      ref={mergeRefs(popoverRef, ref)}
      type="nonmodal"
    >
      <div className={classNames['chat-launcher-popover__box']}>
        <TitleBar popoverRef={popoverRef} />
        <BasicWebChat className={classNames['chat-launcher-popover__webchat']} />
      </div>
    </PopoverPolymiddlewareProxy>
  );
}

ChatLauncherPopover.displayName = 'ChatLauncherPopover';

export default memo(forwardRef(ChatLauncherPopover));
export { chatLauncherPopoverPropsSchema, type ChatLauncherPopoverProps };
