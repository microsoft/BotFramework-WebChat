import { type ReactNode } from 'react';
import templateMiddleware, {
  type InferMiddleware,
  type InferProps,
  type InferRequest
} from '../../../middleware/private/templateMiddleware';

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

type Props = Readonly<{ children?: ReactNode | undefined }>;

const template = templateMiddleware<Request, Props>('activity border');

const {
  createMiddleware: createActivityBorderMiddleware,
  extractMiddleware: extractActivityBorderDecoratorMiddleware,
  Provider: ActivityBorderDecoratorMiddlewareProvider,
  Proxy: ActivityBorderDecoratorMiddlewareProxy
} = template;

type ActivityBorderDecoratorMiddleware = InferMiddleware<typeof template>;
type ActivityBorderDecoratorMiddlewareProps = InferProps<typeof template>;
type ActivityBorderDecoratorMiddlewareRequest = InferRequest<typeof template>;

export {
  ActivityBorderDecoratorMiddlewareProvider,
  ActivityBorderDecoratorMiddlewareProxy,
  createActivityBorderMiddleware,
  extractActivityBorderDecoratorMiddleware,
  type ActivityBorderDecoratorMiddleware,
  type ActivityBorderDecoratorMiddlewareProps,
  type ActivityBorderDecoratorMiddlewareRequest
};
