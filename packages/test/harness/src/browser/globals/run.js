import getHost from './host';

export default function () {
  return (
    window.run ||
    (window.run = (fn, doneOptions) => {
      const host = getHost();

      window.addEventListener('error', event => host.error(event.error));

      // Run the test, signal start by host.ready().
      // On success or failure, call host.done() or host.error() correspondingly.
      return host
        .sendDevToolsCommand('Emulation.setEmulatedMedia', {
          // Setting "value" to "" (empty string) does not unset "forced-colors".
          features: [{ name: 'forced-colors', value: 'none' }]
        })
        .then(host.ready)
        .then(fn)
        .then(() => host.done(doneOptions))
        .catch(host.error);
    })
  );
}
