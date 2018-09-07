export * from './index';

import createCognitiveServicesWebSpeechPonyfill from './createCognitiveServicesWebSpeechPonyfill';
import createBrowserWebSpeechPonyfill from './createBrowserWebSpeechPonyfill';
import renderMarkdown from './renderMarkdown';

export {
  createCognitiveServicesWebSpeechPonyfill,
  createBrowserWebSpeechPonyfill,
  renderMarkdown
}

window['WebChat'] = {
  ...window['WebChat'],
  createCognitiveServicesWebSpeechPonyfill,
  createBrowserWebSpeechPonyfill,
  renderMarkdown
};
