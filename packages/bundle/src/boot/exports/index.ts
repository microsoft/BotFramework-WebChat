export * from './minimal';

// #region Overrides
export * from '../actual/full';
export {
  createStyleSet,
  ReactWebChat as default,
  ReactWebChat,
  renderWebChat,
  version,
  type StrictStyleOptions,
  type StyleOptions
} from '../actual/full';
// #endregion

// #region Overrides for backward compatibility
import { deprecateObject } from '@msinternal/botframework-webchat-base/utils';

import * as hooks from '../actual/hook/full';

const deprecatedHooks = deprecateObject(
  hooks,
  "`import { hooks } from 'botframework-webchat'` has been deprecated, use `import { %s } from 'botframework-webchat/hook'` instead."
) as typeof hooks; // Need explicit type casting.

export { deprecatedHooks as hooks };

import * as Components from '../actual/component/full';

const deprecatedComponents = deprecateObject(
  Components,
  "`import { Components } from 'botframework-webchat'` has been deprecated, use `import { %s } from 'botframework-webchat/component'` instead."
) as typeof Components; // Need explicit type casting.

export { deprecatedComponents as Components };
// #endregion
