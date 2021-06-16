import { DirectLineCardAction } from 'botframework-webchat-core';

import FunctionMiddleware, { CallFunction } from './FunctionMiddleware';

type PerformCardActionParameter = {
  cardAction?: DirectLineCardAction;
  displayText?: string;
  getSignInUrl?: () => string;
  target?: any;
  text?: string;
  type?: string;
  value?: any;
};

type PerformCardAction = CallFunction<[PerformCardActionParameter], void>;

type CardActionMiddleware = FunctionMiddleware<[{ dispatch: (action: any) => void }], [PerformCardActionParameter], {}>;

export default CardActionMiddleware;

export { PerformCardAction };
