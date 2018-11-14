export * from './index-minimal';

import addVersion from './addVersion';
import coreRenderWebChat from './renderWebChat';
import createCognitiveServicesWebSpeechPonyfillFactory from './createCognitiveServicesWebSpeechPonyfillFactory';
import ReactWebChat from './FullReactWebChat';
import renderMarkdown from './renderMarkdown';

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

addVersion('full');
