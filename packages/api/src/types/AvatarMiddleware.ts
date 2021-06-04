import { StrictStyleOptions } from '../StyleOptions';
import ComponentMiddleware, { ComponentFactory } from './ComponentMiddleware';
import DirectLineActivity from './external/DirectLineActivity';

export type AvatarComponentFactoryArguments = [
  {
    activity: DirectLineActivity;
    fromUser: boolean;
    styleOptions: StrictStyleOptions;
  }
];

export type AvatarComponentFactory = ComponentFactory<AvatarComponentFactoryArguments, {}>;

type AvatarMiddleware = ComponentMiddleware<[], AvatarComponentFactoryArguments, {}>;

export default AvatarMiddleware;
