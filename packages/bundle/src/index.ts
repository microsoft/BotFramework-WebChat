export * from './index-minimal';

import addVersion from './addVersion';
import coreRenderWebChat from './renderWebChat';
import createCognitiveServicesBingSpeechPonyfillFactory from './createCognitiveServicesBingSpeechPonyfillFactory';
import createCognitiveServicesSpeechServicesPonyfillFactory from './createCognitiveServicesSpeechServicesPonyfillFactory';
import ReactWebChat from './FullReactWebChat';
import renderMarkdown from './renderMarkdown';

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

export default ReactWebChat

export {
  createCognitiveServicesBingSpeechPonyfillFactory,
  createCognitiveServicesSpeechServicesPonyfillFactory,
  renderMarkdown,
  renderWebChat
}

window['WebChat'] = {
  ...window['WebChat'],
  createCognitiveServicesBingSpeechPonyfillFactory,
  createCognitiveServicesSpeechServicesPonyfillFactory,
  ReactWebChat,
  renderMarkdown,
  renderWebChat
};

addVersion('full');
