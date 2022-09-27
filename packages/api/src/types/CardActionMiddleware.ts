import type { DirectLineCardAction } from 'botframework-webchat-core';

import FunctionMiddleware from './FunctionMiddleware';

type PerformCardAction = (cardAction: DirectLineCardAction, event?: { target: EventTarget }) => void;

type CardActionMiddleware = FunctionMiddleware<
  [{ dispatch: (action: any) => void }],
  [
    {
      cardAction: DirectLineCardAction;
      getSignInUrl?: () => string;
      target: any;
    }
  ],
  {}
>;

export default CardActionMiddleware;

export { PerformCardAction };
