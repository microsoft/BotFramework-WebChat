import React, { useCallback, useContext, useEffect, useState, useRef } from 'react';
import { hooks } from 'botframework-webchat';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';

import './index.css';
import OAuthContext from '../../../oauth/Context';

const { useActivities, useDismissNotification, usePostActivity, useSetNotification } = hooks;

const AUTHENTICATING = 'AUTHENTICATING';
const AUTHENTICATION_PENDING = 'AUTHENTICATION_PENDING';

export const BotSignInToast = ({ notification }) => {
  const {
    data: { content },
    id
  } = notification;
  const { connectionName, tokenExchangeResource: { id: oauthId, uri } = {} } = content;
  const { acquireToken, getAccount, onSignIn } = useContext(OAuthContext);
  const [authenticationStatus, setAuthenticationStatus] = useState(AUTHENTICATION_PENDING);
  const { current: invokeId } = useRef(
    Math.random()
      .toString(36)
      .substr(2, 10)
  );

  console.log(content);

  const [activities] = useActivities();
  const dismissNotification = useDismissNotification();
  const postActivity = usePostActivity();
  const setNotification = useSetNotification();

  const exchangeToken = useCallback(
    async resourceUri => {
      const user = getAccount();
      if (!user) {
        await onSignIn();
      }
      const { accessToken } = await acquireToken({ scopes: [resourceUri] });
      return accessToken;
    },
    [acquireToken, getAccount]
  );

  const handleDismiss = useCallback(() => {
    dismissNotification(id);
  }, [dismissNotification, id]);

  useEffect(() => {
    const invokeActivity = activities.find(
      ({ channelData: { invokeId: activityInvokeId } = {} }) => invokeId === activityInvokeId
    );
    if (invokeActivity) {
      const { channelData: { state } = {} } = invokeActivity;
      if (state === 'send failed') {
        dismissNotification(id);
        setNotification({
          id: 'traditionalbotauthentication',
          data: { content },
          level: 'error',
          message: 'There was an error authenticating the bot.'
        });
      } else if (state === 'sent') {
        dismissNotification(id);
        setNotification({
          id: 'signinsuccessful',
          level: 'success',
          message: 'The bot was authenticated successfully'
        });
      }
    }
  }, [activities]);

  useEffect(() => {
    if (authenticationStatus === AUTHENTICATING) {
      (async function() {
        try {
          const token = await exchangeToken('api://61598522-abf1-49ba-bbb4-3fb89f4ad9a6/ReadUser');
          token &&
            postActivity({
              channelData: { invokeId },
              type: 'invoke',
              name: 'signin/tokenExchange',
              value: {
                id: oauthId,
                connectionName,
                token
              }
            });
        } catch (error) {
          dismissNotification(id);
          setNotification({
            id: 'traditionalbotauthentication',
            data: { content },
            level: 'error',
            message: 'Authenticating the bot failed'
          });
        }
      })();
    }
  }, [authenticationStatus]);

  const handleAgreeClick = useCallback(() => {
    authenticationStatus !== AUTHENTICATING && setAuthenticationStatus(AUTHENTICATING);
  }, [authenticationStatus, setAuthenticationStatus]);

  return (
    <div aria-label="Sign in" role="dialog" className="app__signInNotification">
      <i aria-hidden={true} className="ms-Icon ms-Icon--Signin app__signInNotification__icon" />
      {'Allow the bot to access your account? '}
      {authenticationStatus === AUTHENTICATION_PENDING && (
        <React.Fragment>
          <button className="app__signInNotification__button" onClick={handleAgreeClick} type="button">
            Yes
          </button>{' '}
          <button className="app__signInNotification__button" onClick={handleDismiss} type="button">
            No
          </button>
        </React.Fragment>
      )}
      {authenticationStatus === AUTHENTICATING && <Spinner styles={{ root: { paddingLeft: '8px' } }} />}
    </div>
  );
};
