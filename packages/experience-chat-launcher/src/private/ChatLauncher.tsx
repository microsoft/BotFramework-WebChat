import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { reduxStoreSchema } from '@msinternal/botframework-webchat-redux-store';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import {
  buttonComponent,
  chatLauncherButtonComponent,
  ChatLauncherButtonPolymiddlewareProxy,
  createButtonPolymiddleware,
  createChatLauncherButtonPolymiddleware,
  createPopoverPolymiddleware,
  popoverComponent,
  type Polymiddleware
} from 'botframework-webchat-api/middleware';
import { Composer } from 'botframework-webchat-component/component';
import { directLineJSBotConnection } from 'botframework-webchat-core/schema';
import cx from 'classnames';
import React, { memo, useMemo, useRef } from 'react';
import { instance, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import ChatLauncherStylesheet from '../stylesheet/ChatLauncherStylesheet';
import styles from './ChatLauncher.module.css';
import ChatLauncherButton from './private/ChatLauncherButton';
import ChatLauncherPopover from './private/ChatLauncherPopover';
import Button from './private/polymiddleware/Button';
import NonModalPopover from './private/polymiddleware/NonModalPopover';

const chatLauncherPropsSchema = pipe(
  object({
    directLine: directLineJSBotConnection(),
    nonce: optional(string()),
    store: reduxStoreSchema,
    stylesRoot: optional(instance(Node))
  }),
  readonly()
);

type ChatLauncherProps = InferInput<typeof chatLauncherPropsSchema>;

function ChatLauncher(props: ChatLauncherProps) {
  const { directLine, nonce, store, stylesRoot } = validateProps(chatLauncherPropsSchema, props);

  const classNames = useStyles(styles);
  const styleOptions = useMemo(() => ({ stylesRoot }), [stylesRoot]);
  const popoverTargetRef = useRef<Element>(null);

  const polymiddleware = useMemo<readonly Polymiddleware[]>(
    () =>
      Object.freeze([
        createButtonPolymiddleware(
          () => request => buttonComponent(Button, { appearance: request.appearance, size: request.size })
        ),
        createChatLauncherButtonPolymiddleware(() => () => chatLauncherButtonComponent(ChatLauncherButton)),
        createPopoverPolymiddleware(
          next => request => (request.type === 'nonmodal' ? popoverComponent(NonModalPopover) : next(request))
        )
      ]),
    []
  );

  return (
    <div className={cx('webchat', classNames['webchat-experience-chat-launcher'])}>
      <Composer directLine={directLine} polymiddleware={polymiddleware} store={store} styleOptions={styleOptions}>
        <ChatLauncherStylesheet nonce={nonce} />
        <ChatLauncherButtonPolymiddlewareProxy hasMessage={true} popoverTargetRef={popoverTargetRef} />
        <ChatLauncherPopover ref={popoverTargetRef} />
      </Composer>
    </div>
  );
}

ChatLauncher.displayName = 'ChatLauncher';

export default memo(ChatLauncher);
