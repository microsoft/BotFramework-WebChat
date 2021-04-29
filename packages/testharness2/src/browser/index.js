import 'core-js/stable';
import 'regenerator-runtime/runtime';

import expect from './globals/expect';
import getHost from './globals/host';
import webDriverPort from './globals/webDriverPort';
import webDriverProxy from './globals/webDriverProxy';

window.test = (fn, doneOptions) => {
  // We need to set up the channel port, before setting up other globals.
  webDriverPort();

  const host = getHost();

  expect();
  webDriverProxy();

  window.addEventListener('error', event => host.error(event.error));

  return Promise.resolve()
    .then(host.ready)
    .then(fn)
    .then(() => host.done(doneOptions))
    .catch(host.error);
};
