import React, { useCallback, useContext, useEffect, useMemo, useState, useRef } from 'react';
import { hooks } from 'botframework-webchat';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';

import './index.css';
import OAuthContext from '../../../../oauth/Context';

const { useActivities, usePostActivity } = hooks;

const AUTHENTICATING = 'AUTHENTICATING';
const AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED';
const AUTHENTICATION_PENDING = 'AUTHENTICATION_PENDING';
const AUTHENTICATION_SUCCESSFUL = 'AUTHENTICATION_SUCCESSFUL';

const OnBehalfOfAttachment = ({ card, next }) => {
  const {
    attachment: {
      content: { connectionName, tokenExchangeResource: { id, uri } = {} }
    }
  } = card;
  const { acquireToken, getAccount } = useContext(OAuthContext);
  const [authenticationStatus, setAuthenticationStatus] = useState(AUTHENTICATION_PENDING);
  const { current: invokeId } = useRef(
    Math.random()
      .toString(36)
      .substr(2, 10)
  );
  const oauthCard = useMemo(() => next(card), [next, card]);

  const [activities] = useActivities();
  const postActivity = usePostActivity();

  const exchangeToken = useCallback(
    async resourceUri => {
      const user = getAccount();
      if (user) {
        const { accessToken } = await acquireToken({ scopes: [resourceUri] });
        return accessToken;
      }
      setAuthenticationStatus(AUTHENTICATION_FAILED);
    },
    [acquireToken, getAccount]
  );

  useEffect(() => {
    const invokeActivity = activities.find(
      ({ channelData: { invokeId: activityInvokeId } = {} }) => invokeId === activityInvokeId
    );
    if (invokeActivity) {
      const { channelData: { state } = {} } = invokeActivity;
      if (state === 'send failed') {
        setAuthenticationStatus(AUTHENTICATION_FAILED);
      } else if (state === 'sent') {
        setAuthenticationStatus(AUTHENTICATION_SUCCESSFUL);
      }
    }
  }, [activities, invokeId]);

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
                id,
                connectionName,
                token
              }
            });
        } catch (error) {
          setAuthenticationStatus(AUTHENTICATION_FAILED);
        }
      })();
    }
  }, [authenticationStatus]);

  const handleClickAllow = useCallback(() => {
    authenticationStatus !== AUTHENTICATING && setAuthenticationStatus(AUTHENTICATING);
  }, [authenticationStatus, setAuthenticationStatus]);

  if (authenticationStatus === AUTHENTICATION_FAILED) {
    return oauthCard;
  }

  return (
    <div className="card">
      <div>The Bot has requested to access your account</div>
      <div className="separator" />
      <div className="ac-actionSet buttons">
        <div className="button-container">
          <button className="ac-pushButton style-default" type="button" onClick={handleClickAllow}>
            Allow
          </button>
          <div className="status">
            {authenticationStatus === AUTHENTICATING ? (
              <Spinner />
            ) : authenticationStatus === AUTHENTICATION_SUCCESSFUL ? (
              <i className="ms-Icon ms-Icon--SkypeCircleCheck" aria-hidden="true" />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnBehalfOfAttachment;
