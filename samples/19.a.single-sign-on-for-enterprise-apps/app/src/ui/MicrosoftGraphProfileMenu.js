import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import './ProfileMenu.css';
import compose from '../utils/compose';
import fetchJSON from '../utils/fetchJSON';

import connectMicrosoftGraphProfileAvatar from '../microsoftGraphProfile/hoc/avatarURL';
import connectMicrosoftGraphProfileName from '../microsoftGraphProfile/hoc/name';
import connectMicrosoftGraphSignInButton from '../microsoftGraphProfile/hoc/signInButton';
import connectMicrosoftGraphSignOutButton from '../microsoftGraphProfile/hoc/signOutButton';
import MicrosoftGraphProfileComposer from '../microsoftGraphProfile/Composer';

const AAD_SETTINGS_URL = '/api/aad/settings';

async function fetchSettings() {
  try {
    const { authorizeURL, clientId } = await fetchJSON(AAD_SETTINGS_URL);

    return { authorizeURL, clientId };
  } catch (err) {
    throw new Error('OAuth: Failed to fetch settings');
  }
}

const MicrosoftGraphProfileMenu = ({
  avatarURL,
  name,
  onSignIn,
  onSignOut
}) => {
  const [expanded, setExpanded] = useState(false);
  const signedIn = !!onSignOut;

  useEffect(() => {
    window.addEventListener('signin', ({ data: { provider } = {} }) => provider === 'aad' && onSignIn && onSignIn());

    return () => window.removeEventListener('signin', onSignIn);
  });

  useEffect(() => {
    window.addEventListener('signout', onSignOut);

    return () => window.removeEventListener('signout', onSignOut);
  });

  const avatarStyle = useMemo(() => ({
    backgroundImage: `url(${ avatarURL || '/images/Microsoft-Graph-64px-DDD-White.png' })`
  }), [avatarURL]);

  const handleSignIn = useCallback(() => {
    onSignIn && onSignIn();
    setExpanded(false);
  }, [onSignIn]);

  const handleSignOut = useCallback(() => {
    onSignOut && onSignOut();
    setExpanded(false);
  }, [onSignOut]);

  const handleToggleExpand = useCallback(() => setExpanded(!expanded), [expanded]);

  return (
    <div
      aria-expanded={ expanded }
      className="sso__profile"
    >
      <button
        aria-label="Open profile menu"
        className="sso__profileAvatar"
        onClick={ signedIn ? handleToggleExpand : handleSignIn }
        style={ avatarStyle }
      >
        { signedIn && <div className="sso__profileAvatarBadge sso__profileAvatarBadge__microsoft" /> }
      </button>
      {
        signedIn && expanded &&
          <ul className="sso__profileMenu">
            {
              name &&
                <li className="sso__profileMenuItem">
                  <span>
                    Signed in as <strong>{ name }</strong>
                  </span>
                </li>
            }
            {
              onSignOut &&
                <li className="sso__profileMenuItem">
                  <a
                    href="https://portal.office.com/account/#apps"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Review access on Office.com
                  </a>
                </li>
            }
            {
              onSignOut &&
                <li className="sso__profileMenuItem">
                  <button
                    onClick={ handleSignOut }
                    type="button"
                  >
                    Sign out
                  </button>
                </li>
            }
          </ul>
      }
    </div>
  );
}

MicrosoftGraphProfileMenu.defaultProps = {
  accessToken: '',
  avatarURL: '',
  name: '',
  oauthReviewAccessURL: '',
  onSignIn: undefined,
  onSignOut: undefined,
  setAccessToken: undefined
};

MicrosoftGraphProfileMenu.propTypes = {
  accessToken: PropTypes.string,
  avatarURL: PropTypes.string,
  name: PropTypes.string,
  oauthReviewAccessURL: PropTypes.string,
  onSignIn: PropTypes.func,
  onSignOut: PropTypes.func,
  setAccessToken: PropTypes.func
};

const ComposedMicrosoftGraphProfileMenu = compose(
  connectMicrosoftGraphProfileAvatar(),
  connectMicrosoftGraphProfileName(),
  connectMicrosoftGraphSignInButton(({ onClick }) => ({ onSignIn: onClick })),
  connectMicrosoftGraphSignOutButton(({ onClick }) => ({ onSignOut: onClick }))
)(MicrosoftGraphProfileMenu);

const ConnectedMicrosoftGraphProfileMenu = ({
  accessToken,
  onAccessTokenChange
}) => {
  const [oauthAuthorizeURL, setOAuthAuthorizeURL ] = useState('');

  useMemo(async () => {
    const { authorizeURL } = await fetchSettings();

    setOAuthAuthorizeURL(authorizeURL);
  }, []);

  return (
    <MicrosoftGraphProfileComposer
      accessToken={ accessToken }
      oauthAuthorizeURL={ oauthAuthorizeURL }
      onAccessTokenChange={ onAccessTokenChange }
    >
      <ComposedMicrosoftGraphProfileMenu />
    </MicrosoftGraphProfileComposer>
  );
};

ConnectedMicrosoftGraphProfileMenu.defaultProps = {
  onSignedInChange: undefined
};

ConnectedMicrosoftGraphProfileMenu.propTypes = {
  accessToken: PropTypes.string.isRequired,
  onAccessTokenChange: PropTypes.func.isRequired,
  onSignedInChange: PropTypes.func
};

export default ConnectedMicrosoftGraphProfileMenu
