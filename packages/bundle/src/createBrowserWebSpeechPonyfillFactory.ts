import { WebSpeechPonyfill } from 'botframework-webchat-api';

export default function createBrowserWebSpeechPonyfillFactory(): () => WebSpeechPonyfill {
  // eslint-disable-next-line dot-notation
  if (!window.SpeechRecognition && !window['webkitSpeechRecognition']) {
    console.warn('Web Chat: This browser does not support Web Speech API Speech Recognition.');
  }

  if (!window.speechSynthesis) {
    console.warn('Web Chat: This browser does not support Web Speech API Speech Synthesis.');
  }

  return () => ({
    // eslint-disable-next-line dot-notation
    SpeechGrammarList: window.SpeechGrammarList || window['webkitSpeechGrammarList'],
    // eslint-disable-next-line dot-notation
    SpeechRecognition: window.SpeechRecognition || window['webkitSpeechRecognition'],
    speechSynthesis: window.speechSynthesis,
    SpeechSynthesisUtterance: window.SpeechSynthesisUtterance
  });
}
