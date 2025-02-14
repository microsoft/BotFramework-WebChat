/* global globalThis:readonly */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
import { buildInfo as apiBuildInfo } from 'botframework-webchat-api';
import { buildInfo as componentBuildInfo } from 'botframework-webchat-component';
import { buildInfo as coreBuildInfo } from 'botframework-webchat-core';

function setMetaTag(name: string, content: string) {
  try {
    const { document } = globalThis;

    if (typeof document !== 'undefined' && document.createElement && document.head && document.head.appendChild) {
      const meta = document.querySelector(`html meta[name="${encodeURI(name)}"]`) || document.createElement('meta');

      meta.setAttribute('name', name);
      meta.setAttribute('content', content);

      document.head.appendChild(meta);
    }
  } catch {}
}

type BuildMeta = Readonly<{
  version: string;
  variant: string;
  buildTool: string;
  moduleFormat: string;
}>;

export default function addVersion(buildInfo: BuildMeta) {
  setMetaTag(
    'botframework-webchat:api',
    `version=${apiBuildInfo.version}; build-tool=${apiBuildInfo.buildTool}; module-format=${apiBuildInfo.moduleFormat}`
  );
  setMetaTag(
    'botframework-webchat:bundle',
    `version=${buildInfo.version}; variant=${buildInfo.variant}; build-tool=${buildInfo.buildTool}; module-format=${buildInfo.moduleFormat}`
  );
  setMetaTag(
    'botframework-webchat:component',
    `version=${componentBuildInfo.version}; build-tool=${componentBuildInfo.buildTool}; module-format=${componentBuildInfo.moduleFormat}`
  );
  setMetaTag(
    'botframework-webchat:core',
    `version=${coreBuildInfo.version}; build-tool=${coreBuildInfo.buildTool}; module-format=${coreBuildInfo.moduleFormat}`
  );

  setMetaTag('botframework-webchat:bundle:variant', buildInfo.variant);
  setMetaTag('botframework-webchat:bundle:version', buildInfo.version);
  setMetaTag('botframework-webchat:core:version', coreBuildInfo.version);
  setMetaTag('botframework-webchat:ui:version', componentBuildInfo.version);
}
