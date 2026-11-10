/* eslint no-magic-numbers: ["error", { "ignore": [0, 10] }] */

import { jwtDecode } from 'jwt-decode';

import uniqueID from '../../utils/uniqueID';

type RectifiedUserID = {
  /** The user ID to use. */
  readonly final: string;
  readonly fromAction: unknown;
  /** The user ID in the Direct Line token, if any. */
  readonly fromToken: string | undefined;
};

function randomUserID(): string {
  return `r_${uniqueID().substring(0, 10)}`;
}

/**
 * The user ID to connect with: the one in the Direct Line token wins, then the one passed in if valid, else a random one.
 * Warns when the user ID passed in is ignored.
 *
 * Shared by `connectMachine.ts` and the connection service.
 */
// TODO: [P2] We should move this check and rectification to DirectLineJS.
export default function rectifyUserID(directLine: { token?: unknown }, userIDFromAction: unknown): RectifiedUserID {
  const { token } = directLine;

  let userIDFromToken: string | undefined;

  // TODO: Add test to make sure "jwt-decode" work as expected.
  try {
    userIDFromToken = ((jwtDecode(token as string) || {}) as { user?: string }).user;
  } catch {
    // Not a JWT, or no token.
  }

  let final: string;

  if (userIDFromToken) {
    if (userIDFromAction && userIDFromAction !== userIDFromToken) {
      console.warn(
        'Web Chat: user ID is both specified in the Direct Line token and passed in, will use the user ID from the token.'
      );
    }

    final = userIDFromToken;
  } else if (userIDFromAction) {
    if (typeof userIDFromAction !== 'string') {
      console.warn('Web Chat: user ID must be a string.');

      final = randomUserID();
    } else if (/^dl_/u.test(userIDFromAction)) {
      console.warn(
        'Web Chat: user ID prefixed with "dl_" is reserved and must be embedded into the Direct Line token to prevent forgery.'
      );

      final = randomUserID();
    } else {
      final = userIDFromAction;
    }
  } else {
    final = randomUserID();
  }

  return Object.freeze({ final, fromAction: userIDFromAction, fromToken: userIDFromToken });
}

export type { RectifiedUserID };
