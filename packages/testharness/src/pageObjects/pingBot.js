import random from 'math-random';

import { timeouts } from '../constants';
import dispatchAction from './internal/dispatchAction';
import getActivities from './getActivities';
import wait from './wait';

export default async function() {
  const pingId = random()
    .toString(36)
    .substr(2, 5);

  dispatchAction({ type: 'WEB_CHAT/SEND_EVENT', payload: { name: 'webchat/ping', value: pingId } });

  await wait(
    {
      message: '"pong" event from bot',
      fn: () =>
        getActivities().some(({ name, type, value }) => name === 'webchat/pong' && type === 'event' && value === pingId)
    },
    Math.max(timeouts.directLine, timeouts.postActivity)
  );
}
