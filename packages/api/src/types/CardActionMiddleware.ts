import { DirectLineCardAction } from 'botframework-webchat-core';

import FunctionMiddleware, { CallFunction } from './FunctionMiddleware';

type PerformCardAction = CallFunction<
  [
    {
      cardAction: DirectLineCardAction;
      getSignInUrl?: () => string;
      target: any;
    }
  ],
  void
>;

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
