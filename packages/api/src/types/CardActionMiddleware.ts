import type { DirectLineCardAction, GlobalScopePonyfill } from 'botframework-webchat-core';

import type { StrictStyleOptions } from '../StyleOptions.js';
import FunctionMiddleware from './FunctionMiddleware';

type PerformCardAction = (
  cardAction: DirectLineCardAction,
  event?: { readonly target: EventTarget } | undefined,
  init?: { readonly replyToId?: string | undefined } | undefined
) => void;

type CardActionMiddleware = FunctionMiddleware<
  [
    {
      dispatch: (action: any) => void;
      ponyfill: GlobalScopePonyfill;
      styleOptions: StrictStyleOptions;
    }
  ],
  [
    {
      cardAction: DirectLineCardAction;
      getSignInUrl?: () => string;
      /** ID of the activity which the card action originates from. */
      replyToId?: string | undefined;
      target: any;
    }
  ],
  // Following @types/react to use {} for props.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {}
>;

export default CardActionMiddleware;

export { type PerformCardAction };
