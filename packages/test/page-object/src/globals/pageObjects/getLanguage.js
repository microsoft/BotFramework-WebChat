import { getState } from '../testHelpers/createStore';
import getStoreMode, { getTestHandle, ReduxOnlyTest } from '../testHelpers/storeMode';

/** The language Web Chat talks to the bot in (`language` of the Redux store), in both store modes. */
export default function getLanguage() {
  if (getStoreMode() === 'default') {
    // The default providers that connected last, through their read-only test handle.
    const testHandle = getTestHandle();

    if (!testHandle) {
      throw new ReduxOnlyTest('getLanguage() needs Web Chat connected on the default providers.');
    }

    return testHandle.getLanguage();
  }

  return getState().language;
}
