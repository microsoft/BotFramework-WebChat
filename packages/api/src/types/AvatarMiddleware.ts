import type { DirectLineActivity } from 'botframework-webchat-core';

import { StrictStyleOptions } from '../StyleOptions';
import ComponentMiddleware, { ComponentFactory } from './ComponentMiddleware';

type AvatarComponentFactoryArguments = [
  {
    activity: DirectLineActivity;
    fromUser: boolean;
    styleOptions: StrictStyleOptions;
  }
];

type AvatarComponentFactory = ComponentFactory<AvatarComponentFactoryArguments, {}>;

type AvatarMiddleware = ComponentMiddleware<[], AvatarComponentFactoryArguments, {}>;

export default AvatarMiddleware;

export type { AvatarComponentFactory };
