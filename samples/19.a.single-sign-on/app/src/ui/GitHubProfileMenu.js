import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import './ProfileMenu.css';
import compose from '../utils/compose';
import fetchJSON from '../utils/fetchJSON';

import connectGitHubProfileAvatar from '../gitHubProfile/hoc/avatarURL';
import connectGitHubProfileName from '../gitHubProfile/hoc/name';
import connectGitHubSignInButton from '../gitHubProfile/hoc/signInButton';
import connectGitHubSignOutButton from '../gitHubProfile/hoc/signOutButton';
import GitHubProfileComposer from '../gitHubProfile/Composer';

const GITHUB_OAUTH_ACCESS_TOKEN = 'GITHUB_OAUTH_ACCESS_TOKEN';
const SETTINGS_URL = '/api/github/settings';

async function fetchSettings() {
  try {
    const { authorizeURL, clientId } = await fetchJSON(SETTINGS_URL);

    return {
      authorizeURL,
      clientId
    };
  } catch (err) {
    throw new Error('OAuth: Failed to fetch settings');
  }
}

const GitHubProfileMenu = ({
  avatarURL,
  name,
  oauthReviewAccessURL,
  onSignIn,
  onSignOut
}) => {
  const [expanded, setExpanded] = useState(false);
  const signedIn = !!onSignOut;

  useEffect(() => {
    window.addEventListener('signin', ({ data: { provider } = {} }) => provider === 'github' && onSignIn && onSignIn());

    return () => window.removeEventListener('signin', onSignIn);
  });

  useEffect(() => {
    window.addEventListener('signout', onSignOut);

    return () => window.removeEventListener('signout', onSignOut);
  });

  const avatarStyle = useMemo(() => ({
    backgroundImage: `url(${ avatarURL || '/images/GitHub-Mark-64px-DDD-White.png' })`
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
      />
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
              onSignOut && oauthReviewAccessURL &&
                <li className="sso__profileMenuItem">
                  <a href={ oauthReviewAccessURL } rel="noopener noreferrer" target="_blank">
                    Review access on GitHub
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

GitHubProfileMenu.defaultProps = {
  accessToken: '',
  avatarURL: '',
  name: '',
  oauthReviewAccessURL: '',
  onSignIn: undefined,
  onSignOut: undefined,
  setAccessToken: undefined
};

GitHubProfileMenu.propTypes = {
  accessToken: PropTypes.string,
  avatarURL: PropTypes.string,
  name: PropTypes.string,
  oauthReviewAccessURL: PropTypes.string,
  onSignIn: PropTypes.func,
  onSignOut: PropTypes.func,
  setAccessToken: PropTypes.func
};

const ComposedGitHubProfileMenu = compose(
  connectGitHubProfileAvatar(),
  connectGitHubProfileName(),
  connectGitHubSignInButton(({ onClick }) => ({ onSignIn: onClick })),
  connectGitHubSignOutButton(({ onClick }) => ({ onSignOut: onClick }))
)(GitHubProfileMenu);

const ConnectedGitHubProfileMenu = ({
  onSignedInChange
}) => {
  const [accessToken, setAccessTokenInternal] = useState(sessionStorage.getItem(GITHUB_OAUTH_ACCESS_TOKEN));
  const [oauthAuthorizeURL, setOAuthAuthorizeURL] = useState('');
  const [oauthReviewAccessURL, setOAuthReviewAccessURL] = useState('');

  useMemo(() => {
    console.log(`Dispatching "accesstokenchange" event for GitHub token "${ (accessToken || '').substr(0, 5) }".`);

    const event = new Event('accesstokenchange');

    event.data = { accessToken, provider: 'github' };
    window.dispatchEvent(event);

    onSignedInChange && onSignedInChange(!!accessToken);
  }, [accessToken]);

  useMemo(async () => {
    const { authorizeURL, clientId } = await fetchSettings();

    setOAuthAuthorizeURL(authorizeURL);
    setOAuthReviewAccessURL(`https://github.com/settings/connections/applications/${ clientId }`);
  }, []);

  const setAccessToken = accessToken => {
    setAccessTokenInternal(accessToken);
    accessToken ? sessionStorage.setItem(GITHUB_OAUTH_ACCESS_TOKEN, accessToken) : sessionStorage.removeItem(GITHUB_OAUTH_ACCESS_TOKEN);
    onSignedInChange && onSignedInChange(!!accessToken);
  };

  return (
    <GitHubProfileComposer
      accessToken={ accessToken }
      oauthAuthorizeURL={ oauthAuthorizeURL }
      onAccessTokenChange={ setAccessToken }
    >
      <ComposedGitHubProfileMenu
        oauthReviewAccessURL={ oauthReviewAccessURL }
      />
    </GitHubProfileComposer>
  );
};

ConnectedGitHubProfileMenu.defaultProps = {
  onSignedInChange: undefined
};

ConnectedGitHubProfileMenu.propTypes = {
  onSignedInChange: PropTypes.func
};

export default ConnectedGitHubProfileMenu
