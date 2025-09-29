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
import { deprecateNamespace } from '@msinternal/botframework-webchat-base/utils';

import * as hooks from '../actual/hook/full';

const deprecatedHooks = deprecateNamespace(
  hooks,
  "`import { hooks } from 'botframework-webchat-component'` has been deprecated, use `import { %s } from 'botframework-webchat-component/hook'` instead."
);

export { deprecatedHooks as hooks };

import * as Components from '../actual/component/full';

const deprecatedComponents = deprecateNamespace(
  Components,
  "`import { Components } from 'botframework-webchat-component'` has been deprecated, use `import { %s } from 'botframework-webchat-component/component'` instead."
);

export { deprecatedComponents as Components };
// #endregion
