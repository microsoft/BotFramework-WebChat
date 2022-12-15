import getHost from './host';

export default function () {
  return (
    window.run ||
    (window.run = (fn, doneOptions) => {
      const host = getHost();

      window.addEventListener('error', event => host.error(event.error));

      // Run the test, signal start by host.ready().
      // On success or failure, call host.done() or host.error() correspondingly.
      // This function will be executed in both Jest and "npm run browser".
      return (
        host
          // Previous run may have enabled "forced-colors", we should unset it.
          .sendDevToolsCommand('Emulation.setEmulatedMedia', {
            features: [{ name: 'forced-colors', value: '' }]
          })
          // Some tests may have changed the time zone, we should unset it.
          .then(() => host.sendDevToolsCommand('Emulation.setTimezoneOverride', { timezoneId: 'Etc/UTC' }))
          .then(host.ready)
          .then(fn)
          .then(() => host.done(doneOptions))
          .catch(host.error)
      );
    })
  );
}
