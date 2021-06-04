import DirectLineCardAction from './external/DirectLineCardAction';
import FunctionMiddleware, { CallFunction } from './FunctionMiddleware';

export type PerformCardAction = CallFunction<
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
