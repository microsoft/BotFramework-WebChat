import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { reduxStoreSchema } from '@msinternal/botframework-webchat-redux-store';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import {
  chatLauncherButtonComponent,
  ChatLauncherButtonPolymiddlewareProxy,
  createChatLauncherButtonPolymiddleware,
  createIconButtonPolymiddleware,
  iconButtonComponent,
  type Polymiddleware
} from 'botframework-webchat-api/middleware';
import { Composer } from 'botframework-webchat-component/component';
import { DirectLineJSBotConnection } from 'botframework-webchat-core';
import cx from 'classnames';
import React, { memo, useMemo } from 'react';
import {
  custom,
  function_,
  instance,
  object,
  optional,
  pipe,
  readonly,
  safeParse,
  string,
  type InferInput
} from 'valibot';

import ChatLauncherStylesheet from '../stylesheet/ChatLauncherStylesheet';
import styles from './ChatLauncher.module.css';
import ChatLauncherButton from './private/ChatLauncherButton';
import IconButton from './private/IconButton';

// Best-effort to check if it is an Observable.
const observableSchema = object({ subscribe: function_() });

// TODO: [P0] Move this to botframework-webchat-core.
const directLineSchema = object<DirectLineJSBotConnection>({
  activity$: custom(value => safeParse(observableSchema, value).success),
  connectionStatus$: custom(value => safeParse(observableSchema, value).success),
  end: optional(function_()),
  getSessionId: optional(function_()),
  postActivity: function_(),
  referenceGrammarId: optional(string()),
  setUserId: optional(function_())
});

const chatLauncherPropsSchema = pipe(
  object({
    directLine: directLineSchema,
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

  const polymiddleware = useMemo<readonly Polymiddleware[]>(
    () =>
      Object.freeze([
        createChatLauncherButtonPolymiddleware(() => () => chatLauncherButtonComponent(ChatLauncherButton)),
        createIconButtonPolymiddleware(() => () => iconButtonComponent(IconButton))
      ]),
    []
  );

  return (
    <div className={cx('webchat', classNames['webchat-experience-chat-launcher'])}>
      <Composer directLine={directLine} polymiddleware={polymiddleware} store={store} styleOptions={styleOptions}>
        <ChatLauncherStylesheet nonce={nonce} />
        <ChatLauncherButtonPolymiddlewareProxy hasMessage={true} />
      </Composer>
    </div>
  );
}

ChatLauncher.displayName = 'ChatLauncher';

export default memo(ChatLauncher);
