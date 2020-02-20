import React, { useCallback } from 'react';
import { hooks } from 'botframework-webchat';

import './index.css';

const { useDismissNotification, usePerformCardAction } = hooks;

export const TraditionalBotAuthenticationToast = ({ notification }) => {
  const {
    data: {
      content: {
        buttons: [signin]
      }
    } = {},
    id
  } = notification;

  const dismissNotification = useDismissNotification();
  const performCardAction = usePerformCardAction();

  const handleClick = useCallback(() => {
    dismissNotification(id);
    performCardAction(signin);
  }, [dismissNotification, id, performCardAction, signin]);

  return (
    <div aria-label="Sign in" role="dialog" className="app__signInNotification">
      <i aria-hidden={true} className="ms-Icon ms-Icon--Signin app__signInNotification__icon" />
      {'There was an error authenticating the bot. Please sign in to the bot directly.'}
      <button className="app__signInNotification__button" onClick={handleClick} type="button">
        Login
      </button>
    </div>
  );
};
