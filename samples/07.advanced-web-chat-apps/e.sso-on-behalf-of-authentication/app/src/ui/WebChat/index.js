import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';

import { AppSignInToast, BotSignInToast, TraditionalBotAuthenticationToast } from './Notifications';
import fetchJSON from '../../utils/fetchJSON';
import OAuthContext from '../../oauth/Context';
import './index.css';

const WebChat = () => {
  const [directLine, setDirectLine] = useState(createDirectLine({}));
  const { onSignIn } = useContext(OAuthContext);

  const styleOptions = useMemo(
    () => ({
      backgroundColor: 'rgba(255, 255, 255, .8)'
    }),
    []
  );

  const store = useMemo(
    () =>
      createStore({}, ({ dispatch }) => next => action => {
        if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY' && action.payload.activity.from.role === 'bot') {
          const { content } =
            (action.payload.activity.attachments || []).find(
              ({ contentType }) => contentType === 'application/vnd.microsoft.card.oauth'
            ) || {};

          if (content) {
            const { tokenExchangeResource: { uri } = {} } = content;

            if (uri) {
              dispatch({
                type: 'WEB_CHAT/SET_NOTIFICATION',
                payload: {
                  data: { content },
                  id: 'signin',
                  level: 'info',
                  message: 'Please sign in to the app.'
                }
              });

              return false;
            }
          }
        }

        return next(action);
      }),
    []
  );

  const toastMiddleware = useCallback(
    () => next => ({ notification, ...otherArgs }) => {
      const { id } = notification;

      if (id === 'signin') {
        return onSignIn ? (
          <AppSignInToast notification={notification} />
        ) : (
          <BotSignInToast notification={notification} />
        );
      } else if (id === 'traditionalbotauthentication') {
        return <TraditionalBotAuthenticationToast notification={notification} />;
      }

      return next({ notification, ...otherArgs });
    },
    [onSignIn]
  );

  useEffect(() => {
    (async function() {
      const { token } = await fetchJSON('/api/directline/token');
      setDirectLine(createDirectLine({ token }));
    })().catch(error => console.log(error));
  }, []);

  return (
    <div className="webchat">
      <ReactWebChat
        directLine={directLine}
        toastMiddleware={toastMiddleware}
        store={store}
        styleOptions={styleOptions}
      />
    </div>
  );
};

export default WebChat;
