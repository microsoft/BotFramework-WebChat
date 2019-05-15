import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import Context from './Context';
import openCenter from '../utils/openCenter';

const Composer = ({
  accessToken,
  children,
  oauthAuthorizeURL,
  onAccessTokenChange = () => {},
  onError = () => {}
}) => {
  const context = useMemo(() => ({
    onSignIn: accessToken ? undefined : () => {
      const handleMessage = ({ data, origin }) => {
        const oauthAuthorizeLocation = new URL(oauthAuthorizeURL, window.location.href);

        if (origin !== oauthAuthorizeLocation.origin) {
          return;
        }

        try {
          const params = new URLSearchParams(data);

          if (params.has('error')) {
            const error = params.get('error');

            console.error(error);

            onError(new Error(error));
          } else {
            onAccessTokenChange(params.get('access_token'));
          }
        } catch (err) {
          console.warn(err);

          onError(err);
        } finally {
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);
      openCenter(oauthAuthorizeURL, 'oauth', 360, 640);
    },
    onSignOut: accessToken ? () => onAccessTokenChange('') : undefined
  }), [accessToken, oauthAuthorizeURL, onAccessTokenChange, onError]);

  return (
    <Context.Provider value={ context }>
      { children }
    </Context.Provider>
  );
};

Composer.defaultProps = {
  accessToken: '',
  children: undefined,
  onAccessTokenChange: undefined,
  onError: undefined
};

Composer.propTypes = {
  accessToken: PropTypes.string,
  children: PropTypes.any,
  onAccessTokenChange: PropTypes.func,
  onError: PropTypes.func
};

export default Composer
