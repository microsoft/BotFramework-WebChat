/* global globalThis:readonly, process:readonly */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */

import { version as componentVersion } from 'botframework-webchat-component';
import { version as coreVersion } from 'botframework-webchat-core';

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
  setMetaTag('botframework-webchat:bundle:variant', variant);
  setMetaTag('botframework-webchat:bundle:version', process.env.npm_package_version);
  setMetaTag('botframework-webchat:core:version', coreVersion);
  setMetaTag('botframework-webchat:ui:version', componentVersion);
}
