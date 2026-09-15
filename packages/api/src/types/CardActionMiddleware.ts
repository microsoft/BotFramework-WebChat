import type { DirectLineCardAction } from 'botframework-webchat-core';

import FunctionMiddleware from './FunctionMiddleware';
import type { StrictStyleOptions } from '../StyleOptions.js';

type PerformCardAction = (cardAction: DirectLineCardAction, event?: { target: EventTarget }) => void;

type CardActionMiddleware = FunctionMiddleware<
  [
    {
      dispatch: (action: any) => void;
      styleOptions: StrictStyleOptions;
    }
  ],
  [
    {
      cardAction: DirectLineCardAction;
      getSignInUrl?: () => string;
      target: any;
    }
  ],
  // Following @types/react to use {} for props.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {}
>;

export default CardActionMiddleware;

export { PerformCardAction };
