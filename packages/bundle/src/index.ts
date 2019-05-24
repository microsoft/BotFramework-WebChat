/* eslint dot-notation: ["error", { "allowPattern": "^WebChat$" }] */
// window['WebChat'] is required for TypeScript

export * from './index-minimal';

import addVersion from './addVersion';
import coreRenderWebChat from './renderWebChat';
import createCognitiveServicesBingSpeechPonyfillFactory from './createCognitiveServicesBingSpeechPonyfillFactory';
import createCognitiveServicesSpeechServicesPonyfillFactory from './createCognitiveServicesSpeechServicesPonyfillFactory';
import createStyleSet from './adaptiveCards/Styles/createStyleSetWithAdaptiveCards';
import ReactWebChat from './FullReactWebChat';
import renderMarkdown from './renderMarkdown';

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

export default ReactWebChat;

export {
  createCognitiveServicesBingSpeechPonyfillFactory,
  createCognitiveServicesSpeechServicesPonyfillFactory,
  createStyleSet,
  renderMarkdown,
  renderWebChat
};

window['WebChat'] = {
  ...window['WebChat'],
  createCognitiveServicesBingSpeechPonyfillFactory,
  createCognitiveServicesSpeechServicesPonyfillFactory,
  createStyleSet,
  ReactWebChat,
  renderMarkdown,
  renderWebChat
};

addVersion('full');
