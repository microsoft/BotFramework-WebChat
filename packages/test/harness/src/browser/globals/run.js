import getHost from './host';

export default function () {
  return (
    window.run ||
    (window.run = (fn, doneOptions) => {
      const host = getHost();

      // Accessibility: [document-title] add a page title if not specified.
      document.title = document.title || location.pathname.split('/').reverse()[0];

      // Accessibility: [page-has-heading-one] artificially inject a page header.
      const header = document.createElement('header');
      const headingOne = document.createElement('h1');

      headingOne.textContent = 'Web Chat test';

      header.style.color = 'transparent';
      header.style.height = '1px';
      header.style.overflow = 'hidden';
      header.style.position = 'absolute';
      header.style.top = '0';
      header.style.whiteSpace = 'nowrap';
      header.style.width = '1px';
      header.append(headingOne);

      document.body.prepend(header);

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
          .catch(error =>
            // Chrome occasionally said timezone already set when we navigate away. Need extra F5 to clear it.
            // We did set the timezone, but page navigation should undo it.
            error.message?.includes('"Timezone override is already in effect"') ? undefined : Promise.reject(error)
          )
          .then(host.ready)
          .then(fn)
          .then(() => host.done(doneOptions))
          .catch(host.error)
      );
    })
  );
}
