/* global process:readonly */

// TODO: [P*] Polyfill at the final bundle.
// import 'core-js/features/object/entries.js';

import createAdapters from './createAdapters';

const buildTool = process.env.build_tool;
const moduleFormat = process.env.module_format;
const version = process.env.npm_package_version;

const buildInfo = { buildTool, moduleFormat, version };

export { buildInfo, createAdapters };

if (typeof HTMLDocument !== 'undefined' && typeof document !== 'undefined' && document instanceof HTMLDocument) {
  const version = process.env.npm_package_version;
  const versionMeta = document.createElement('meta');

  versionMeta.setAttribute('name', 'botframework-directlinespeech:version');
  versionMeta.setAttribute('content', version);

  document.head.appendChild(versionMeta);

  const packageMeta = document.createElement('meta');

  packageMeta.setAttribute('name', 'botframework-directlinespeech');
  packageMeta.setAttribute('content', `version=${version}; build_tool=${buildTool}; format=${moduleFormat}`);

  document.head.appendChild(packageMeta);
}
