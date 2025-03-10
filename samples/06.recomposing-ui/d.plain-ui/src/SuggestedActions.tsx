import { hooks } from 'botframework-webchat';
import React, { memo } from 'react';

import type { CardAction } from './CardAction';
import CardActionButton from './CardActionButton';

const { useSuggestedActions } = hooks;

// Web Chat cleaned up the suggestedActions for us.
// If the last activity is from the bot and contains "suggestedActions", Web Chat will send it to us thru "suggestedActions".
function SuggestedActions() {
  const [suggestedActions] = useSuggestedActions();

  return (
    !!suggestedActions.length && (
      <ul>
        {suggestedActions.map((cardAction, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={index}>
            <CardActionButton cardAction={cardAction as unknown as CardAction} />
          </li>
        ))}
      </ul>
    )
  );
}

export default memo(SuggestedActions);
