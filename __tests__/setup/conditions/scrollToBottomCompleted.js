import { Condition } from 'selenium-webdriver';

import { timeouts } from '../../constants.json';

export default function scrollToBottomCompleted() {
  return new Condition('for UI to scroll to bottom', async driver => {
    const done = await driver.executeAsyncScript((timeoutInMS, callback) => {
      const scrollable = document.querySelector('[role="log"] > *');

      // If we do not receive any "scroll" event at all, probably we are at the bottom.
      const defaultTimeout = setTimeout(() => callback(true), timeoutInMS);
      let timeout;
      const handleScroll = () => {
        clearTimeout(defaultTimeout);
        clearTimeout(timeout);

        timeout = setTimeout(() => {
          scrollable.removeEventListener('scroll', handleScroll);
          callback(true);
        }, 200);
      };

      scrollable.addEventListener('scroll', handleScroll);
    }, timeouts.scrollToBottom);

    return done;
  });
}
