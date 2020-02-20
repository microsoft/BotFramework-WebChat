import React, { useCallback, useContext, useMemo, useState } from 'react';

import OAuthContext from '../../oauth/Context';
import './ProfileMenu.css';

const MicrosoftGraphProfileMenu = () => {
  // This will become falsy if sign in is not available, e.g. already signed in or misconfiguration
  // This will become falsy if sign out is not available, e.g. not signed in
  const {
    user: { avatarURL, name },
    onSignIn,
    onSignOut
  } = useContext(OAuthContext);
  const [expanded, setExpanded] = useState(false);
  const signedIn = !!onSignOut;

  // CSS style for displaying avatar as background image.
  // Background image will ease handling 404 or other HTTP errors by not showing the image.
  const avatarStyle = useMemo(
    () => ({
      backgroundImage: `url(${avatarURL || '/images/Microsoft-Graph-64px-DDD-White.png'})`
    }),
    [avatarURL]
  );

  // In addition to running the sign in logic from OAuth context, we will also collapse the menu.
  const handleSignIn = useCallback(() => {
    onSignIn && onSignIn();
    setExpanded(false);
  }, [onSignIn]);

  // In addition to running the sign in logic from OAuth context, we will also collapse the menu.
  const handleSignOut = useCallback(() => {
    onSignOut && onSignOut();
    setExpanded(false);
  }, [onSignOut]);

  const handleToggleExpand = useCallback(() => setExpanded(!expanded), [expanded]);

  return (
    <div className="sso__upperRight">
      <div aria-expanded={expanded} className="sso__profile">
        <button
          aria-label="Open profile menu"
          className="sso__profileAvatar"
          onClick={signedIn ? handleToggleExpand : handleSignIn}
          style={avatarStyle}
        >
          {signedIn && <div className="sso__profileAvatarBadge sso__profileAvatarBadge__microsoft" />}
        </button>
        {signedIn && expanded && (
          <ul className="sso__profileMenu">
            {name && (
              <li className="sso__profileMenuItem">
                <span>
                  Signed in as <strong>{name}</strong>
                </span>
              </li>
            )}
            {onSignOut && (
              <li className="sso__profileMenuItem">
                <a href="https://portal.office.com/account/#apps" rel="noopener noreferrer" target="_blank">
                  Review access on Office.com
                </a>
              </li>
            )}
            {onSignOut && (
              <li className="sso__profileMenuItem">
                <button onClick={handleSignOut} type="button">
                  Sign out
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MicrosoftGraphProfileMenu;
