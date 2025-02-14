import { type WebChatActivity } from 'botframework-webchat-core';

import { StrictStyleOptions } from '../StyleOptions';
import ComponentMiddleware, { ComponentFactory } from './ComponentMiddleware';

type AvatarComponentFactoryArguments = [
  {
    activity: WebChatActivity;
    fromUser: boolean;
    styleOptions: StrictStyleOptions;
  }
];

type AvatarComponentFactory = ComponentFactory<AvatarComponentFactoryArguments, object>;

type AvatarMiddleware = ComponentMiddleware<[], AvatarComponentFactoryArguments, object>;

export default AvatarMiddleware;

export type { AvatarComponentFactory };
