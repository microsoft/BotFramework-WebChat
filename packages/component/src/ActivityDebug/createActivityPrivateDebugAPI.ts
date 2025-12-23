import { createRestrictedDebugAPI } from 'botframework-webchat-core/internal';

function createActivityPrivateDebugAPI(getActivity: () => object) {
  return createRestrictedDebugAPI(['render'], { activity: getActivity });
}

export default createActivityPrivateDebugAPI;
