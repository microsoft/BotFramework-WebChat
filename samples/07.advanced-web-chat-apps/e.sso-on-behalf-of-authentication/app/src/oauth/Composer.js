import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { UserAgentApplication } from 'msal';

import Context from './Context';
import fetchProfileDisplayName from './fetchProfileDisplayName';
import fetchProfilePhotoAsBase64 from './fetchProfilePhotoAsBase64';
import requiresInteraction from '../utils/requiresInteraction';
import fetchJSON from '../utils/fetchJSON';

const GRAPH_SCOPES = {
  OPENID: 'openid',
  PROFILE: 'profile',
  USER_READ: 'User.Read',
  MAIL_READ: 'Mail.Read'
};

const GRAPH_REQUESTS = {
  LOGIN: {
    scopes: [GRAPH_SCOPES.OPENID, GRAPH_SCOPES.PROFILE, GRAPH_SCOPES.USER_READ]
  },
  EMAIL: {
    scopes: [GRAPH_SCOPES.MAIL_READ]
  }
};

// Composer will prepare a React context object to use by consumer.
const Composer = ({
  children,
  onError = error => {
    console.error(error);
  }
}) => {
  const [accessToken, setAccessToken] = useState();
  const [authenticating, setAuthenticating] = useState();
  const [avatarURL, setAvatarURL] = useState();
  const [msal, setMSAL] = useState();
  const [name, setName] = useState();

  const acquireToken = useCallback(
    (request = GRAPH_REQUESTS.LOGIN) => {
      if (msal) {
        return msal.acquireTokenSilent(request).catch(error => {
          if (requiresInteraction(error)) {
            return msal.acquireTokenPopup(request);
          }
        });
      }
    },
    [msal]
  );

  const getAccount = useCallback(() => msal && msal.getAccount(), [msal]);

  const onSignIn = useMemo(() => {
    return !accessToken && msal
      ? async () => {
          try {
            if (!authenticating) {
              setAuthenticating(true);
              const loginResponse = await msal.loginPopup(GRAPH_REQUESTS.LOGIN);
              if (loginResponse) {
                const { accessToken } = await acquireToken();
                setAccessToken(accessToken);
              }
              setAuthenticating(false);
            }
          } catch (error) {
            onError(error);
            setAuthenticating(false);
          }
        }
      : undefined;
  }, [accessToken, acquireToken, authenticating, msal, onError, setAccessToken, setAuthenticating]);

  const onSignOut = useMemo(() => {
    if (!msal) {
      setAccessToken('');
      return;
    }

    return accessToken
      ? () => {
          msal.logout();
          setAccessToken('');
        }
      : undefined;
  }, [accessToken, setAccessToken, msal]);

  // If access token change, we will refresh the profile name and picture from Azure AD
  useMemo(async () => {
    const [avatarURL, name] = await Promise.all([
      fetchProfilePhotoAsBase64(accessToken),
      fetchProfileDisplayName(accessToken)
    ]);

    setAvatarURL(avatarURL);
    setName(name);
  }, [accessToken]);

  useEffect(() => {
    (async function () {
      try {
        const { clientId, redirectURI, tenantId } = await fetchJSON('/api/aad/settings');
        const msalConfig = {
          auth: {
            clientId,
            authority: `https://login.microsoftonline.com/${tenantId}`,
            redirectUri: redirectURI
          },
          cache: {
            cacheLocation: 'localStorage'
          }
        };

        setMSAL(new UserAgentApplication(msalConfig));
      } catch (err) {
        throw new Error('OAuth: Failed to fetch settings');
      }
    })();
  }, []);

  useEffect(() => {
    (async function () {
      if (getAccount()) {
        const { accessToken } = await acquireToken();
        setAccessToken(accessToken);
      }
    })();
  }, [acquireToken, getAccount, msal]);

  const context = useMemo(
    () => ({
      acquireToken,
      getAccount,
      onSignIn,
      onSignOut,
      user: {
        avatarURL,
        name
      }
    }),
    [acquireToken, avatarURL, getAccount, name, onSignIn, onSignOut]
  );

  return <Context.Provider value={context}>{children}</Context.Provider>;
};

Composer.defaultProps = {
  children: undefined,
  onError: undefined
};

Composer.propTypes = {
  children: PropTypes.any,
  onError: PropTypes.func
};

export default Composer;
