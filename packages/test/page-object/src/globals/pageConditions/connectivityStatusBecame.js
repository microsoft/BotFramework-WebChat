import became from './became';
import { getState } from '../testHelpers/createStore';
import getStoreMode, { getTestHandle } from '../testHelpers/storeMode';

/**
 * Waits until the connectivity status of Web Chat (as `useConnectivityStatus()`) is the value, e.g. "reconnecting" or
 * "connectingslow". The same in both store modes: from the Redux store, or from the test handle of the default providers.
 */
export default function connectivityStatusBecame(connectivityStatus) {
  return became(
    `connectivity status became "${connectivityStatus}"`,
    () =>
      (getStoreMode() === 'default' ? getTestHandle()?.getConnectivityStatus() : getState().connectivityStatus) ===
      connectivityStatus,
    15000
  );
}
