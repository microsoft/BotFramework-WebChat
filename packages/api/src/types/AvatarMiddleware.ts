import { type WebChatActivity } from 'botframework-webchat-core';

import {
  __INTERNAL_DO_NOT_USE__legacyAvatarMiddlewareOriginalRequestSymbol,
  type AvatarPolymiddlewareRequest
} from '@msinternal/botframework-webchat-api-middleware';
import { StrictStyleOptions } from '../StyleOptions';
import ComponentMiddleware, { ComponentFactory } from './ComponentMiddleware';

type AvatarComponentFactoryArguments = [
  {
    // We need to keep the original polymiddleweare request while running inside legacy middleware.
    // When we transit from legacy middleware back to polymiddleware, we can restore the request object.
    [__INTERNAL_DO_NOT_USE__legacyAvatarMiddlewareOriginalRequestSymbol]: AvatarPolymiddlewareRequest;
    activity: WebChatActivity;
    fromUser: boolean;
    styleOptions: StrictStyleOptions;
  }
];

// Following @types/react to use {} for props.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type AvatarComponentFactory = ComponentFactory<AvatarComponentFactoryArguments, {}>;

// Following @types/react to use {} for props.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type AvatarMiddleware = ComponentMiddleware<[], AvatarComponentFactoryArguments, {}>;

export default AvatarMiddleware;

export type { AvatarComponentFactory };
