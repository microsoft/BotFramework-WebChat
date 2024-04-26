/* global globalThis:readonly, process:readonly */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */

import { buildInfo as apiBuildInfo } from 'botframework-webchat-api';
import { buildInfo as componentBuildInfo } from 'botframework-webchat-component';
import { buildInfo as coreBuildInfo } from 'botframework-webchat-core';

const bundleVersion = process.env.npm_package_version;

function setMetaTag(name, content) {
  try {
    const { document } = globalThis;

    if (typeof document !== 'undefined' && document.createElement && document.head && document.head.appendChild) {
      const meta = document.querySelector(`html meta[name="${encodeURI(name)}"]`) || document.createElement('meta');

      meta.setAttribute('name', name);
      meta.setAttribute('content', content);

      document.head.appendChild(meta);
    }
  } catch (err) {}
}

export default function addVersion(variant) {
  setMetaTag(
    'botframework-webchat:api',
    `version=${apiBuildInfo.version}; format=${apiBuildInfo.moduleFormat}; transpiler=${apiBuildInfo.transpiler}`
  );
  setMetaTag(
    'botframework-webchat:bundle',
    `version=${bundleVersion}; variant=${variant}; format=${process.env.module_format}; transpiler=${process.env.transpiler}`
  );
  setMetaTag(
    'botframework-webchat:component',
    `version=${componentBuildInfo.version}; format=${componentBuildInfo.moduleFormat}; transpiler=${componentBuildInfo.transpiler}`
  );
  setMetaTag(
    'botframework-webchat:core',
    `version=${coreBuildInfo.version}; format=${coreBuildInfo.moduleFormat}; transpiler=${coreBuildInfo.transpiler}`
  );

  setMetaTag('botframework-webchat:bundle:variant', variant);
  setMetaTag('botframework-webchat:bundle:version', process.env.npm_package_version);
  setMetaTag('botframework-webchat:core:version', coreBuildInfo.version);
  setMetaTag('botframework-webchat:ui:version', componentBuildInfo.version);
}
