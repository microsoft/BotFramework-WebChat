import { type ReactNode } from 'react';
import templateDecorator, {
  InferRequest,
  type InferMiddleware,
  type InferProps
} from '../../private/templateDecorator';
import ActivityBorderDecoratorRequestContext, {
  type ActivityBorderDecoratorRequest
} from './ActivityBorderDecoratorRequestContext';

type Props = Readonly<{
  children?: ReactNode | undefined;
  showFlair?: boolean | undefined;
  showLoader?: boolean | undefined;
}>;

const template = templateDecorator<Props, ActivityBorderDecoratorRequest>(
  'activity border',
  ActivityBorderDecoratorRequestContext
);

const { createMiddleware: createActivityBorderMiddleware, Proxy: ActivityBorderDecoratorMiddlewareProxy } = template;

type ActivityBorderDecoratorMiddleware = InferMiddleware<typeof template>;
type ActivityBorderDecoratorMiddlewareProps = InferProps<typeof template>;
type ActivityBorderDecoratorMiddlewareRequest = InferRequest<typeof template>;

export {
  ActivityBorderDecoratorMiddlewareProxy,
  createActivityBorderMiddleware,
  type ActivityBorderDecoratorMiddleware,
  type ActivityBorderDecoratorMiddlewareProps,
  type ActivityBorderDecoratorMiddlewareRequest
};
