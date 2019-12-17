import { hooks } from 'botframework-webchat-component';
import React from 'react';

import CardActionButton from './CardActionButton';

const { useSuggestedActions } = hooks;

// Web Chat cleaned up the suggestedActions for us.
// If the last activity is from the bot and contains "suggestedActions", Web Chat will send it to us thru "suggestedActions".
const SuggestedActions = () => {
  const suggestedActions = useSuggestedActions();

  return (
    !!suggestedActions.length && (
      <ul>
        {suggestedActions.map((cardAction, index) => (
          <li key={index}>
            <CardActionButton cardAction={cardAction} />
          </li>
        ))}
      </ul>
    )
  );
};

export default SuggestedActions;
