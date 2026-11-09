import became from './became';
import getActionHistory from '../pageObjects/internal/getActionHistory';
import root from '../pageElements/root';
import getStoreMode, { getTestHandle } from '../testHelpers/storeMode';

// In default mode, no action history: the connectivity status of the default providers, through their test handle.
function connectedOnce() {
  if (getStoreMode() === 'default') {
    return ['connected', 'reconnected'].includes(getTestHandle()?.getConnectivityStatus());
  }

  return !!~getActionHistory().findIndex(({ type }) => type === 'DIRECT_LINE/CONNECT_FULFILLED');
}

export default function uiConnected() {
  return became(`connected`, () => connectedOnce() && !root().querySelector(`.webchat__connectivityStatus`), 15000);
}
