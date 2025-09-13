import ReactWebChat, { type ReactWebChatProps } from 'botframework-webchat-component';
import React from 'react';

import AddFullBundle, { type AddFullBundleProps } from './AddFullBundle';

type FullReactWebChatProps = Readonly<ReactWebChatProps & Omit<AddFullBundleProps, 'children'>>;

// Add additional props to <WebChat>, so it support additional features
const FullReactWebChat = (props: FullReactWebChatProps) => (
  <AddFullBundle {...props}>{extraProps => <ReactWebChat {...props} {...extraProps} />}</AddFullBundle>
);

export default FullReactWebChat;

export type { FullReactWebChatProps };
