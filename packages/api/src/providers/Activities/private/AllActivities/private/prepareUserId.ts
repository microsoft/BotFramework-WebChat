import { DirectLineJSBotConnection } from 'botframework-webchat-core';
import decode from 'jwt-decode';
import random from 'math-random';

function randomUserId(): `r_${string}` {
  // eslint-disable-next-line no-magic-numbers
  return `r_${random().toString(36).substring(2, 12)}`;
}

export default function prepareUserId(
  directLine: DirectLineJSBotConnection,
  userIdFromProps: string | undefined
): string {
  const { token } = directLine;

  let finalUserId: string;
  let userIdFromToken: string | undefined;

  // TODO: Add test to make sure "jwt-decode" work as expected.
  try {
    userIdFromToken = ((decode(token) || {}) as { user?: string }).user;
    // eslint-disable-next-line no-empty
  } catch (err) {}

  if (userIdFromToken) {
    if (userIdFromProps && userIdFromProps !== userIdFromToken) {
      console.warn(
        'botframework-webchat: user ID is both specified in the Direct Line token and passed in, will use the user ID from the token.'
      );
    }

    finalUserId = userIdFromToken;
  } else if (userIdFromProps) {
    if (typeof userIdFromProps !== 'string') {
      console.warn('botframework-webchat: user ID must be a string.');

      finalUserId = randomUserId();
    } else if (/^dl_/u.test(userIdFromProps)) {
      console.warn(
        'botframework-webchat: user ID prefixed with "dl_" is reserved and must be embedded into the Direct Line token to prevent forgery.'
      );

      finalUserId = randomUserId();
    }

    finalUserId = userIdFromProps;
  } else {
    finalUserId = randomUserId();
  }

  if (!userIdFromToken && finalUserId !== userIdFromToken && directLine.setUserId) {
    // DirectLineJS could send the custom userId to the bot if it is not in the token.
    // This will help sending `conversationUpdate/membersAdded` activity to the bot sooner.
    directLine.setUserId(finalUserId);
  }

  return finalUserId;
}
