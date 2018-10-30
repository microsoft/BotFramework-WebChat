export * from './index-core';

import coreRenderWebChat from './renderWebChat';
import createCognitiveServicesWebSpeechPonyfillFactory from './createCognitiveServicesWebSpeechPonyfillFactory';
import ReactWebChat from './FullReactWebChat';
import renderMarkdown from './renderMarkdown';

import { version as componentVersion } from 'botframework-webchat-component';
import { version as coreVersion } from 'botframework-webchat-core';

declare var VERSION

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

export default ReactWebChat

export {
  createCognitiveServicesWebSpeechPonyfillFactory,
  renderMarkdown,
  renderWebChat
}

window['WebChat'] = {
  ...window['WebChat'],
  createCognitiveServicesWebSpeechPonyfillFactory,
  ReactWebChat,
  renderMarkdown,
  renderWebChat
};

try {
  const { document } = global as any;

  if (typeof document !== 'undefined' && document.createElement && document.head && document.head.appendChild) {
    const meta = document.createElement('meta');
    const content = {
      'bundle-version': VERSION,
      'component-version': componentVersion,
      'core-version': coreVersion
    };

    meta.setAttribute('name', 'botframework-webchat');
    meta.setAttribute('content', Object.keys(content).map(key => `${ key }=${ encodeURIComponent(content[key]) }`).join(', '));

    document.head.appendChild(meta);
  }
} catch (err) {}
