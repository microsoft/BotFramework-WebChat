import React, { useCallback, useContext, useEffect, useState, useRef } from 'react';
import { hooks } from 'botframework-webchat';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import random from 'math-random';

import './index.css';
import OAuthContext from '../../../oauth/Context';

const { useActivities, useDismissNotification, usePostActivity, useSetNotification } = hooks;

export const BotSignInToast = ({ notification }) => {
  const {
    data: { content },
    id
  } = notification;
  const [authenticating, setAuthenticating] = useState();
  const { acquireToken, getAccount, onSignIn } = useContext(OAuthContext);
  const { connectionName, tokenExchangeResource: { id: oauthId, uri } = {} } = content;
  const { current: invokeId } = useRef(random().toString(36).substr(2, 10));

  const [activities] = useActivities();
  const dismissNotification = useDismissNotification();
  const postActivity = usePostActivity();
  const setNotification = useSetNotification();

  const exchangeToken = useCallback(
    async resourceURI => {
      const user = getAccount();
      if (!user) {
        await onSignIn();
      }
      const { accessToken } = await acquireToken({ scopes: [resourceURI] });
      return accessToken;
    },
    [acquireToken, getAccount, onSignIn]
  );

  const handleDismiss = useCallback(() => {
    dismissNotification(id);
  }, [dismissNotification, id]);

  useEffect(() => {
    const invokeActivity = activities.find(
      ({ channelData: { invokeId: activityInvokeId } = {} }) => invokeId === activityInvokeId
    );
    if (invokeActivity) {
      const { channelData: { 'webchat:send-status': sendStatus } = {} } = invokeActivity;
      if (sendStatus === 'send failed') {
        dismissNotification(id);
        setNotification({
          id: 'traditionalbotauthentication',
          data: { content },
          level: 'error',
          message: 'There was an error authenticating the bot.'
        });
      } else if (sendStatus === 'sent') {
        dismissNotification(id);
        setNotification({
          id: 'signinsuccessful',
          level: 'success',
          message: 'The bot was authenticated successfully.'
        });
      }
    }
  }, [activities, content, dismissNotification, id, invokeId, setNotification]);

  useEffect(() => {
    if (authenticating) {
      (async function () {
        try {
          const token = await exchangeToken(uri);
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
            message: 'Authenticating the bot failed.'
          });
        }
      })();
    }
  }, [
    authenticating,
    connectionName,
    content,
    dismissNotification,
    exchangeToken,
    id,
    invokeId,
    oauthId,
    postActivity,
    setNotification,
    uri
  ]);

  const handleAgreeClick = useCallback(() => {
    !authenticating && setAuthenticating(true);
  }, [authenticating, setAuthenticating]);

  return (
    <div aria-label="Sign in" role="dialog" className="app__signInNotification">
      <i aria-hidden={true} className="ms-Icon ms-Icon--Signin app__signInNotification__icon" />
      {'Allow the bot to access your account? '}
      {!authenticating ? (
        <React.Fragment>
          <button className="app__signInNotification__button" onClick={handleAgreeClick} type="button">
            Yes
          </button>{' '}
          <button className="app__signInNotification__button" onClick={handleDismiss} type="button">
            No
          </button>
        </React.Fragment>
      ) : (
        <Spinner styles={{ root: { paddingLeft: '8px' } }} />
      )}
    </div>
  );
};
