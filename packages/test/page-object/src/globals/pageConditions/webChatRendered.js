import became from './became';
import getActionHistory from '../pageObjects/internal/getActionHistory';
import getStoreMode, { getWebChatInternal } from '../testHelpers/storeMode';

// In default mode, no action history: the default providers mounted.
function rendered() {
  if (getStoreMode() === 'default') {
    return getWebChatInternal()?.__INTERNAL_DO_NOT_USE__getProviderMountCounts?.().default > 0;
  }

  return getActionHistory().length;
}

export default function webChatRendered() {
  return became('Web Chat is rendered', rendered, 1000);
}
