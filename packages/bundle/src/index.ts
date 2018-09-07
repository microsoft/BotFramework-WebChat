import createCognitiveServicesWebSpeechPonyfill from './createCognitiveServicesWebSpeechPonyfill';
import createBrowserWebSpeechPonyfill from './createBrowserWebSpeechPonyfill';
import createDirectLine from './createDirectLine';
import renderMarkdown from './renderMarkdown';
import renderWebChat from './renderWebChat';

export default renderWebChat

export {
  createCognitiveServicesWebSpeechPonyfill,
  createBrowserWebSpeechPonyfill,
  createDirectLine,
  renderMarkdown
}

window['WebChat'] = {
  createDirectLine,
  renderMarkdown,
  renderWebChat
};
