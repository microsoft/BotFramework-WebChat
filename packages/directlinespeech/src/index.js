import 'core-js/features/object/entries';

import createAdapters from './createAdapters';

export { createAdapters };

if (typeof HTMLDocument !== 'undefined' && typeof document !== 'undefined' && document instanceof HTMLDocument) {
  const meta = document.createElement('meta');

  meta.setAttribute('name', 'botframework-directlinespeech:version');

  // We injected "process.env.npm_package_version" during compilation.
  // eslint-disable-next-line no-undef
  meta.setAttribute('content', process.env.npm_package_version);

  document.head.appendChild(meta);
}
