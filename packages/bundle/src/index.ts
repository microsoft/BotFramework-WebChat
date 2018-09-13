export * from './index-core';

import { createAdaptiveCardsAttachmentMiddleware } from 'botframework-webchat-component';

import coreRenderWebChat from './renderWebChat';
import createBrowserWebSpeechPonyfill from './createBrowserWebSpeechPonyfill';
import createCognitiveServicesWebSpeechPonyfill from './createCognitiveServicesWebSpeechPonyfill';
import ReactWebChat from './FullReactWebChat';
import renderMarkdown from './renderMarkdown';

// Add additional props to <WebChat>, so it support additional features
const renderWebChat = (props, element) => {
  const attachmentMiddleware = [];

  if (props.attachmentMiddleware) {
    attachmentMiddleware.push(props.attachmentMiddleware);
  }

  attachmentMiddleware.push(createAdaptiveCardsAttachmentMiddleware());

  return coreRenderWebChat(
    {
      ...props,
      attachmentMiddleware,
      renderMarkdown
    },
    element
  );
}

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
