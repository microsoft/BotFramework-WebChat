// TODO: [P2] This component can be replaced by `bindProps`.
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { InjectStyleElements } from '@msinternal/botframework-webchat-styles/react';
import { useStyleOptions } from 'botframework-webchat-api/hook';
import React, { memo, type FunctionComponent } from 'react';
import { never, object, optional, pipe, readonly, string, undefinedable, type InferInput } from 'valibot';

import createChatLauncherStyleElements from './createChatLauncherStyleElements';

const componentStylesheetPropsSchema = pipe(
  object({
    children: optional(never()),
    nonce: undefinedable(string())
  }),
  readonly()
);

type ComponentStylesheetProps = InferInput<typeof componentStylesheetPropsSchema>;

const styleElements = createChatLauncherStyleElements('experience-chat-launcher');

function ChatLauncherStylesheet(props: ComponentStylesheetProps) {
  const { nonce } = validateProps(componentStylesheetPropsSchema, props);

  const [{ stylesRoot }] = useStyleOptions();

  return <InjectStyleElements at={stylesRoot} nonce={nonce} styleElements={styleElements} />;
}

ChatLauncherStylesheet.displayName = 'ChatLauncherStylesheet';

export default memo(ChatLauncherStylesheet as FunctionComponent<ComponentStylesheetProps>);
export { componentStylesheetPropsSchema, type ComponentStylesheetProps };
