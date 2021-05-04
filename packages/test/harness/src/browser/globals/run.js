import getHost from './host';

export default function () {
  return (
    window.run ||
    (window.run = (fn, doneOptions) => {
      const host = getHost();

      window.addEventListener('error', event => host.error(event.error));

      return Promise.resolve()
        .then(host.ready)
        .then(fn)
        .then(() => host.done(doneOptions))
        .catch(host.error);
    })
  );
}
