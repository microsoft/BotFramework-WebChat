import { version as componentVersion } from 'botframework-webchat-component';
import { version as coreVersion } from 'botframework-webchat-core';

function setMetaTag(name, content) {
  try {
    const { document } = global;

    if (typeof document !== 'undefined' && document.createElement && document.head && document.head.appendChild) {
      const meta = document.querySelector(`html meta[name="${ encodeURIComponent(name) }"]`) || document.createElement('meta');

      meta.setAttribute('name', name);
      meta.setAttribute('content', content);

      document.head.appendChild(meta);
    }
  } catch (err) {}
}

export default function (variant) {
  setMetaTag('botframework-webchat:variant', variant);
  setMetaTag('botframework-webchat:version', VERSION);
  setMetaTag('botframework-webchat:version:component', componentVersion);
  setMetaTag('botframework-webchat:version:core', coreVersion);
}
