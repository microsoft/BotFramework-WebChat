import React, { useCallback, useContext, useEffect, useState } from 'react';
import { hooks } from 'botframework-webchat';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';

import './index.css';
import OAuthContext from '../../../oauth/Context';

const { useDismissNotification, useSetNotification } = hooks;

export const AppSignInToast = ({ notification }) => {
  const { id } = notification;
  const { onSignIn } = useContext(OAuthContext);
  const [authenticating, setAuthenticating] = useState();

  const dismissNotification = useDismissNotification();
  const setNotification = useSetNotification();

  const handleClick = useCallback(() => {
    setAuthenticating(true);
    onSignIn();
  }, [setAuthenticating, onSignIn]);

  useEffect(() => {
    if (!onSignIn) {
      dismissNotification(id);
      setNotification({ ...notification, message: '' });
    }
  }, [dismissNotification, id, notification, onSignIn, setNotification]);

  return (
    <div aria-label="Sign in" role="dialog" className="app__signInNotification">
      <i aria-hidden={true} className="ms-Icon ms-Icon--Signin app__signInNotification__icon" />
      Please signin to your account
      {!authenticating ? (
        <button className="app__signInNotification__button" onClick={handleClick} type="button">
          Login
        </button>
      ) : (
        <Spinner styles={{ root: { paddingLeft: '8px' } }} />
      )}
    </div>
  );
};
