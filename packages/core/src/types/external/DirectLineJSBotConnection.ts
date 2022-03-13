// TODO: [P1] #3953 We should fully type it out.

import type { AnyAnd } from '../AnyAnd';
import type { DirectLineActivity } from './DirectLineActivity';
import type { Observable } from './Observable';

type DirectLineJSBotConnection = AnyAnd<{
  postActivity: (activity: DirectLineActivity) => Observable<string>;
}>;

export type { DirectLineJSBotConnection };
