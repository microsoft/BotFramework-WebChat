import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

import compose from '../utils/compose';
import connectSignInButton from '../oauth/hoc/signInButton';
import connectSignOutButton from '../oauth/hoc/signOutButton';
import fetchProfileDisplayName from './fetchProfileDisplayName';
import fetchProfilePhotoAsBase64 from './fetchProfilePhotoAsBase64';
import MicrosoftGraphProfileContext from './Context';
import OAuthComposer from '../oauth/Composer';

const MicrosoftGraphProfileComposer = ({
  accessToken,
  children,
  onSignIn,
  onSignOut
}) => {
  const [avatarURL, setAvatarURL] = useState('');
  const [name, setName] = useState('');

  useMemo(async () => {
    const [avatarURL, name] = await Promise.all([
      fetchProfilePhotoAsBase64(accessToken),
      fetchProfileDisplayName(accessToken)
    ]);

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
    <MicrosoftGraphProfileContext.Provider value={ context }>
      { children }
    </MicrosoftGraphProfileContext.Provider>
  );
}

MicrosoftGraphProfileComposer.defaultProps = {
  accessToken: '',
  children: undefined,
  onSignIn: undefined,
  onSignOut: undefined
};

MicrosoftGraphProfileComposer.propTypes = {
  accessToken: PropTypes.string,
  children: PropTypes.any,
  onSignIn: PropTypes.func,
  onSignOut: PropTypes.func,
};

const ComposedMicrosoftGraphProfileComposer = compose(
  connectSignInButton(({ onClick }) => ({ onSignIn: onClick })),
  connectSignOutButton(({ onClick }) => ({ onSignOut: onClick }))
)(MicrosoftGraphProfileComposer)

const ConnectedMicrosoftGraphProfileComposer = ({
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
    <ComposedMicrosoftGraphProfileComposer accessToken={ accessToken }>
      { children }
    </ComposedMicrosoftGraphProfileComposer>
  </OAuthComposer>

export default ConnectedMicrosoftGraphProfileComposer
