export * from './index-core';

import coreRenderWebChat from './renderWebChat';
import createBrowserWebSpeechPonyfill from './createBrowserWebSpeechPonyfill';
import createCognitiveServicesWebSpeechPonyfill from './createCognitiveServicesWebSpeechPonyfill';
import ReactWebChat from './FullReactWebChat';
import renderMarkdown from './renderMarkdown';

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

export default ReactWebChat

export {
  createCognitiveServicesWebSpeechPonyfill,
  createBrowserWebSpeechPonyfill,
  renderMarkdown,
  renderWebChat
}

window['WebChat'] = {
  ...window['WebChat'],
  createCognitiveServicesWebSpeechPonyfill,
  createBrowserWebSpeechPonyfill,
  ReactWebChat,
  renderMarkdown,
  renderWebChat
};
