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
const OAUTH_REVIEW_ACCESS_URL = '/api/github/oauth/review_access_url';

async function fetchOAuthReviewAccessURL() {
  try {
    const { url } = await fetchJSON(OAUTH_REVIEW_ACCESS_URL);

    return url;
  } catch (err) {
    throw new Error('OAuth: Failed to get review access URL');
  }
}

const ProfileMenu = ({
  avatarURL,
  name,
  onSignIn,
  onSignOut
}) => {
  const [expanded, setExpanded] = useState(false);
  const [oauthReviewAccessURL, setOAuthReviewAccessURL] = useState('');

  useEffect(() => {
    window.addEventListener('signin', ({ data: { provider } = {} }) => provider === 'github' && onSignIn());

    return () => window.removeEventListener('signin', onSignIn);
  });

  useEffect(() => {
    window.addEventListener('signout', onSignOut);

    return () => window.removeEventListener('signout', onSignOut);
  });

  useMemo(async () => setOAuthReviewAccessURL(await fetchOAuthReviewAccessURL()), []);

  const avatarStyle = useMemo(() => ({
    backgroundImage: `url(${ avatarURL || '/images/GitHub-Mark-64px-EEE-White.png' })`
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
        onClick={ handleToggleExpand }
        style={ avatarStyle }
      />
      {
        expanded &&
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
              onSignIn &&
                <li className="sso__profileMenuItem">
                  <button
                    onClick={ handleSignIn }
                    type="button"
                  >
                    Sign in
                  </button>
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

ProfileMenu.defaultProps = {
  accessToken: '',
  avatarURL: '',
  name: '',
  oauthReviewAccessURL: '',
  onSignIn: undefined,
  onSignOut: undefined,
  setAccessToken: undefined
};

ProfileMenu.propTypes = {
  accessToken: PropTypes.string,
  avatarURL: PropTypes.string,
  name: PropTypes.string,
  oauthReviewAccessURL: PropTypes.string,
  onSignIn: PropTypes.func,
  onSignOut: PropTypes.func,
  setAccessToken: PropTypes.func
};

const ComposedProfileMenu = compose(
  connectGitHubProfileAvatar(),
  connectGitHubProfileName(),
  connectGitHubSignInButton(({ onClick }) => ({ onSignIn: onClick })),
  connectGitHubSignOutButton(({ onClick }) => ({ onSignOut: onClick }))
)(ProfileMenu);

const ConnectedProfileMenu = () => {
  const [accessToken, setAccessTokenInternal] = useState(sessionStorage.getItem(GITHUB_OAUTH_ACCESS_TOKEN));

  useMemo(() => {
    console.log('Dispatching "accesstokenchange" event.');

    const event = new Event('accesstokenchange');

    event.data = { accessToken, provider: 'github' };
    window.dispatchEvent(event);
  }, [accessToken]);

  const setAccessToken = accessToken => {
    setAccessTokenInternal(accessToken);
    accessToken ? sessionStorage.setItem(GITHUB_OAUTH_ACCESS_TOKEN, accessToken) : sessionStorage.removeItem(GITHUB_OAUTH_ACCESS_TOKEN);
  };

  return (
    <GitHubProfileComposer
      accessToken={ accessToken }
      oauthAuthorizeURL="/api/github/oauth/authorize"
      onAccessTokenChange={ setAccessToken }
    >
      <ComposedProfileMenu />
    </GitHubProfileComposer>
  );
};

export default ConnectedProfileMenu
