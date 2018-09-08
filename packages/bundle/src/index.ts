export * from './index-core';

import coreRenderWebChat from './index-core';
import createCognitiveServicesWebSpeechPonyfill from './createCognitiveServicesWebSpeechPonyfill';
import createBrowserWebSpeechPonyfill from './createBrowserWebSpeechPonyfill';
import renderMarkdown from './renderMarkdown';
import { createAdaptiveCardsAttachmentMiddleware } from 'component';

// Add additional props to <WebChat>, so it support additional features
const renderWebChat = coreRenderWebChat.bind({
  attachmentMiddleware: [
    createAdaptiveCardsAttachmentMiddleware()
  ]
});

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
  renderMarkdown,
  renderWebChat
};
