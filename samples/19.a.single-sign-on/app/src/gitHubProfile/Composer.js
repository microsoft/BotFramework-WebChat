import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

import compose from '../utils/compose';
import connectSignInButton from '../oauth/hoc/signInButton';
import connectSignOutButton from '../oauth/hoc/signOutButton';
import fetchUserProfile from './fetchUserProfile';
import GitHubProfileContext from './Context';
import OAuthComposer from '../oauth/Composer';

const GitHubProfileComposer = ({
  accessToken,
  children,
  onSignIn,
  onSignOut
}) => {
  const [avatarURL, setAvatarURL] = useState('');
  const [name, setName] = useState('');

  useMemo(async () => {
    const { avatar_url: avatarURL, name } = await fetchUserProfile(accessToken);

    setAvatarURL(avatarURL);
    setName(name);
  }, [accessToken]);

  const context = useMemo(() => ({
    avatarURL,
    name,
    onSignIn,
    onSignOut
  }), [
    avatarURL,
    name,
    onSignIn,
    onSignOut
  ]);

  return (
    <GitHubProfileContext.Provider value={ context }>
      { children }
    </GitHubProfileContext.Provider>
  );
}

GitHubProfileComposer.defaultProps = {
  accessToken: '',
  children: undefined,
  onSignIn: undefined,
  onSignOut: undefined
};

GitHubProfileComposer.propTypes = {
  accessToken: PropTypes.string,
  children: PropTypes.any,
  onSignIn: PropTypes.func,
  onSignOut: PropTypes.func,
};

const ComposedGitHubProfileComposer = compose(
  connectSignInButton(({ onClick }) => ({ onSignIn: onClick })),
  connectSignOutButton(({ onClick }) => ({ onSignOut: onClick }))
)(GitHubProfileComposer)

const ConnectedGitHubProfileComposer = ({
  accessToken,
  children,
  oauthAuthorizeURL,
  onAccessTokenChange
}) =>
  <OAuthComposer
    accessToken={ accessToken }
    oauthAuthorizeURL={ oauthAuthorizeURL }
    onAccessTokenChange={ onAccessTokenChange }
  >
    <ComposedGitHubProfileComposer accessToken={ accessToken }>
      { children }
    </ComposedGitHubProfileComposer>
  </OAuthComposer>

export default ConnectedGitHubProfileComposer
