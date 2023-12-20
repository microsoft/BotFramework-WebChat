import { type WebChatActivity } from 'botframework-webchat-core';

import { StrictStyleOptions } from '../StyleOptions';
import type ComponentMiddleware from './ComponentMiddleware';
import { type ComponentFactory } from './ComponentMiddleware';

type AvatarComponentFactoryArguments = [
  {
    activity: WebChatActivity;
    fromUser: boolean;
    styleOptions: StrictStyleOptions;
  }
];

type AvatarComponentFactory = ComponentFactory<AvatarComponentFactoryArguments, {}>;

type AvatarMiddleware = ComponentMiddleware<[], AvatarComponentFactoryArguments, {}>;

export default AvatarMiddleware;

export type { AvatarComponentFactory };
