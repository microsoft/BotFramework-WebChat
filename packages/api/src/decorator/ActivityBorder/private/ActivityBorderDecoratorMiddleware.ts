import type { EmptyObject } from 'type-fest';
import templateMiddleware from '../../private/templateMiddleware';
import { type activityBorderDecoratorTypeName } from '../types';

type Request = Readonly<{
  /**
   * Decorate the activity as it participate in a livestreaming session.
   *
   * - `"completing"` - decorate as the livestreaming is completing
   * - `"ongoing"` - decorate as the livestreaming is ongoing
   * - `"preparing"` - decorate as the livestreaming is being prepared
   * - `undefined` - not participated in a livestreaming session
   */
  livestreamingState: 'completing' | 'ongoing' | 'preparing' | undefined;

  /**
   * Gets the role of the sender for the activity.
   *
   * - `"bot"` - the sender is a bot or other users
   * - `"channel"` - the sender is the channel service
   * - `"user"` - the sender is the current user
   * - `undefined` - the sender is unknown
   */
  from: 'bot' | 'channel' | `user` | undefined;
}>;

type Props = EmptyObject;

const {
  initMiddleware: initActivityBorderDecoratorMiddleware,
  Provider: ActivityBorderDecoratorMiddlewareProvider,
  Proxy: ActivityBorderDecoratorMiddlewareProxy,
  // False positive, `types` is used for its typing.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  types
} = templateMiddleware<typeof activityBorderDecoratorTypeName, Request, Props>('ActivityBorderDecoratorMiddleware');

type ActivityBorderDecoratorMiddleware = typeof types.middleware;
type ActivityBorderDecoratorMiddlewareInit = typeof types.init;
type ActivityBorderDecoratorMiddlewareProps = typeof types.props;
type ActivityBorderDecoratorMiddlewareRequest = typeof types.request;

export {
  ActivityBorderDecoratorMiddlewareProvider,
  ActivityBorderDecoratorMiddlewareProxy,
  initActivityBorderDecoratorMiddleware,
  type ActivityBorderDecoratorMiddleware,
  type ActivityBorderDecoratorMiddlewareInit,
  type ActivityBorderDecoratorMiddlewareProps,
  type ActivityBorderDecoratorMiddlewareRequest
};
