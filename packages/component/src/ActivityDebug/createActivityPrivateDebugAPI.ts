import { createPrivateDebugAPI } from 'botframework-webchat-core/internal';
import type { ActivityDebugContext } from './ActivityDebugContext';

function createActivityPrivateDebugAPI() {
  return createPrivateDebugAPI<'render', ActivityDebugContext>(['render']);
}

export default createActivityPrivateDebugAPI;
