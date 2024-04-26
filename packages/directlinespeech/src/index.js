/* global process:readonly */
import 'core-js/features/object/entries.js';

import createAdapters from './createAdapters';

export { createAdapters };

if (typeof HTMLDocument !== 'undefined' && typeof document !== 'undefined' && document instanceof HTMLDocument) {
  const version = process.env.npm_package_version;
  const versionMeta = document.createElement('meta');

  versionMeta.setAttribute('name', 'botframework-directlinespeech:version');
  versionMeta.setAttribute('content', version);

  document.head.appendChild(versionMeta);

  const packageMeta = document.createElement('meta');

  packageMeta.setAttribute('name', 'botframework-directlinespeech');
  packageMeta.setAttribute(
    'content',
    `version=${version}; format=${process.env.module_format}; transpiler=${process.env.transpiler}`
  );

  document.head.appendChild(packageMeta);
}
