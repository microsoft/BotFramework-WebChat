/* global process */

import createAdapters from './createAdapters';

export { createAdapters };

if (typeof HTMLDocument !== 'undefined' && typeof document !== 'undefined' && document instanceof HTMLDocument) {
  const meta = document.createElement('meta');

  meta.setAttribute('name', 'botframework-directlinespeech:version');
  meta.setAttribute('content', process.env.npm_package_version);

  document.head.appendChild(meta);
}
