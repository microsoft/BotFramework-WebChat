import { getState } from '../testHelpers/createStore';
import getStoreMode, { getTestHandle, ReduxOnlyTest } from '../testHelpers/storeMode';

export default function getActivities() {
  if (getStoreMode() === 'default') {
    // The default providers that connected last, through their read-only test handle.
    const testHandle = getTestHandle();

    if (!testHandle) {
      throw new ReduxOnlyTest('getActivities() needs Web Chat connected on the default providers.');
    }

    return testHandle.getActivities();
  }

  return getState().activities;
}
