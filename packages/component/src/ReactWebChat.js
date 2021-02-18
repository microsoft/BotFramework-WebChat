import PropTypes from 'prop-types';
import React from 'react';

import BasicWebChat from './BasicWebChat';
import Composer from './Composer';

// Please keep this file as simple as possible. This is for setting up the surface (a.k.a. <Composer>) and <BasicWebChat> only.

// Web developers may choose to put things before/after <BasicWebChat> while still inside the surface.
// For example,
// - They can hide our default send box and built their own using hooks
// - They can run hooks outside of activity/attachment middleware
//   - They will put <Composer> as very top of their page, and allow buttons on their existing page to send message to bot

// Subset of landmark roles: https://w3.org/TR/wai-aria/#landmark_roles
const ARIA_LANDMARK_ROLES = ['complementary', 'contentinfo', 'form', 'main', 'region'];

const ReactWebChat = ({ className, role, ...composerProps }) => {
  // Fallback to "complementary" if specified is not a valid landmark role.
  if (!ARIA_LANDMARK_ROLES.includes(role)) {
    role = 'complementary';
  }

  return (
    <Composer {...composerProps}>
      <BasicWebChat className={className} role={role} />
    </Composer>
  );
};

export default ReactWebChat;

ReactWebChat.defaultProps = {
  className: undefined,
  role: 'complementary',
  ...Composer.defaultProps
};

ReactWebChat.propTypes = {
  className: PropTypes.string,
  role: PropTypes.oneOf(ARIA_LANDMARK_ROLES),
  ...Composer.propTypes
};
