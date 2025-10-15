import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { ThemeProvider } from 'botframework-webchat/component';
import cx from 'classnames';
import React, { memo, useMemo } from 'react';
import { custom, object, optional, pipe, readonly, string, union, type InferInput } from 'valibot';

import ChatLauncherStylesheet from '../stylesheet/ChatLauncherStylesheet';
import styles from './ChatLauncher.module.css';
import ChatLauncherButton from './private/ChatLauncherButton';

const chatLauncherPropsSchema = pipe(
  object({
    nonce: optional(string()),
    stylesRoot: optional(
      union(
        [
          custom<HTMLLinkElement>(value => value instanceof HTMLLinkElement && value.rel === 'stylesheet'),
          custom<HTMLStyleElement>(value => value instanceof HTMLStyleElement)
        ],
        '"stylesRoot" must be either <link rel="stylesheet"> or <style>'
      )
    )
  }),
  readonly()
);

type ChatLauncherProps = InferInput<typeof chatLauncherPropsSchema>;

function ChatLauncher(props: ChatLauncherProps) {
  const { nonce, stylesRoot } = validateProps(chatLauncherPropsSchema, props);

  const classNames = useStyles(styles);
  const styleOptions = useMemo(() => ({ stylesRoot }), [stylesRoot]);

  return (
    <div className={cx('webchat', classNames['webchat-experience-chat-launcher'])}>
      <ThemeProvider styleOptions={styleOptions}>
        <ChatLauncherStylesheet nonce={nonce} />
        <ChatLauncherButton />
      </ThemeProvider>
    </div>
  );
}

ChatLauncher.displayName = 'ChatLauncher';

export default memo(ChatLauncher);
