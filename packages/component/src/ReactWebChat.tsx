import PropTypes from 'prop-types';
import React, { VFC } from 'react';

import BasicWebChat from './BasicWebChat';
import Composer, { ComposerProps } from './Composer';

// Please keep this file as simple as possible. This is for setting up the surface (a.k.a. <Composer>) and <BasicWebChat> only.

// Web developers may choose to put things before/after <BasicWebChat> while still inside the surface.
// For example,
// - They can hide our default send box and built their own using hooks
// - They can run hooks outside of activity/attachment middleware
//   - They will put <Composer> as very top of their page, and allow buttons on their existing page to send message to bot

// Subset of landmark roles: https://w3.org/TR/wai-aria/#landmark_roles
const ARIA_LANDMARK_ROLES = ['complementary', 'contentinfo', 'form', 'main', 'region'];

type ReactWebChatProps = Omit<ComposerProps, 'children'> & {
  className?: string;
  role?: 'complementary' | 'contentinfo' | 'form' | 'main' | 'region';
};

const ReactWebChat: VFC<ReactWebChatProps> = ({ className, role, ...composerProps }) => (
  <Composer {...composerProps}>
    <BasicWebChat className={className} role={role} />
  </Composer>
);

ReactWebChat.defaultProps = {
  className: undefined,
  role: undefined,
  ...Composer.defaultProps
};

const {
  // Excluding "children" from ComposerProps.
  children: _,
  ...composerPropTypesWithoutChildren
} = Composer.propTypes;

ReactWebChat.propTypes = {
  className: PropTypes.string,
  // Ignoring deficiencies with TypeScript/PropTypes inference.
  // @ts-ignore
  role: PropTypes.oneOf(ARIA_LANDMARK_ROLES),
  ...composerPropTypesWithoutChildren
};

export default ReactWebChat;

export type { ReactWebChatProps };
