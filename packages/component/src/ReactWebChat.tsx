import React, { VFC } from 'react';

import BasicWebChat from './BasicWebChat';
import Composer, { ComposerProps } from './Composer';

// Please keep this file as simple as possible. This is for setting up the surface (a.k.a. <Composer>) and <BasicWebChat> only.

// Web developers may choose to put things before/after <BasicWebChat> while still inside the surface.
// For example,
// - They can hide our default send box and built their own using hooks
// - They can run hooks outside of activity/attachment middleware
//   - They will put <Composer> as very top of their page, and allow buttons on their existing page to send message to bot

type ReactWebChatProps = Omit<ComposerProps, 'children'>;

const ReactWebChat: VFC<ReactWebChatProps> = ({ ...composerProps }) => (
  <Composer {...composerProps}>
    <BasicWebChat />
  </Composer>
);

ReactWebChat.defaultProps = {
  ...Composer.defaultProps
};

const {
  // Excluding "children" from ComposerProps.
  children: _,
  ...composerPropTypesWithoutChildren
} = Composer.propTypes;

ReactWebChat.propTypes = {
  ...composerPropTypesWithoutChildren
};

export default ReactWebChat;

export type { ReactWebChatProps };
