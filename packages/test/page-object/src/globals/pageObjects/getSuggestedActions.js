import { getState } from '../testHelpers/createStore';
import getStoreMode, { getTestHandle, ReduxOnlyTest } from '../testHelpers/storeMode';

/** The suggested actions set last (`suggestedActions` of the Redux store), in both store modes. */
export default function getSuggestedActions() {
  if (getStoreMode() === 'default') {
    // The default providers that connected last, through their read-only test handle.
    const testHandle = getTestHandle();

    if (!testHandle) {
      throw new ReduxOnlyTest('getSuggestedActions() needs Web Chat connected on the default providers.');
    }

    return testHandle.getSuggestedActions();
  }

  return getState().suggestedActions;
}
