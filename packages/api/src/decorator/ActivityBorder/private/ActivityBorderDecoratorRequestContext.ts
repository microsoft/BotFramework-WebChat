import { createContext } from 'react';
import { ActivityBorderDecoratorMiddlewareRequest } from './ActivityBorderDecoratorMiddleware';

type ActivityBorderDecoratorRequestContextType = Readonly<{
  request: ActivityBorderDecoratorMiddlewareRequest;
}>;

const ActivityBorderDecoratorRequestContext = createContext<ActivityBorderDecoratorRequestContextType>(
  Object.freeze({
    request: Object.freeze({
      from: undefined,
      livestreamingState: undefined
    })
  })
);

export default ActivityBorderDecoratorRequestContext;
export { type ActivityBorderDecoratorRequestContextType };
