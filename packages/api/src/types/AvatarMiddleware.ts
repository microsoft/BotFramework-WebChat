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

// Following @types/react to use {} for props.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type AvatarComponentFactory = ComponentFactory<AvatarComponentFactoryArguments, {}>;

// Following @types/react to use {} for props.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type AvatarMiddleware = ComponentMiddleware<[], AvatarComponentFactoryArguments, {}>;

export default AvatarMiddleware;

export type { AvatarComponentFactory };
