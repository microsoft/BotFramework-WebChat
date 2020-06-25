import React from 'react';

import BasicWebChat from './BasicWebChat';
import Composer from './Composer';

// Please keep this file as simple as possible. This is for setting up the surface (a.k.a. <Composer>) and <BasicWebChat> only.

// Web developers may choose to put things before/after <BasicWebChat> while still inside the surface.
// For example,
// - They can hide our default send box and built their own using hooks
// - They can run hooks outside of activity/attachment middleware
//   - They will put <Composer> as very top of their page, and allow buttons on their existing page to send message to bot

const ReactWebChat = props => (
  <Composer {...props}>
    <BasicWebChat />
  </Composer>
);

export default ReactWebChat;

ReactWebChat.defaultProps = {
  ...Composer.defaultProps
};

ReactWebChat.propTypes = {
  ...Composer.propTypes
};
