import { createPrivateDebugAPI } from 'botframework-webchat-core/internal';

function createActivityPrivateDebugAPI(getActivity: () => object) {
  return createPrivateDebugAPI(['render'], { activity: getActivity });
}

export default createActivityPrivateDebugAPI;
