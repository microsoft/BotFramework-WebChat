export * from './index-core';

import coreRenderWebChat from './renderWebChat';
import createCognitiveServicesWebSpeechPonyfillFactory from './createCognitiveServicesWebSpeechPonyfillFactory';
import ReactWebChat from './FullReactWebChat';
import renderMarkdown from './renderMarkdown';

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

export default ReactWebChat

export {
  createCognitiveServicesWebSpeechPonyfillFactory,
  ReactWebChat,
  renderMarkdown,
  renderWebChat
}
