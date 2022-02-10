// TODO: [P1] #3953 We should fully type it out.

import type { AnyAnd } from '../AnyAnd';
import type { Observable } from './Observable';
import type DirectLineActivity from './DirectLineActivity';

type DirectLineJSBotConnection = AnyAnd<{
  postActivity: (activity: DirectLineActivity) => Observable<string>;
}>;

export default DirectLineJSBotConnection;
