export default function createBrowserWebSpeechPonyfillFactory() {
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    console.warn('Web Chat: This browser does not support Web Speech API Speech Recognition.');
  }

  if (!window.speechSynthesis) {
    console.warn('Web Chat: This browser does not support Web Speech API Speech Synthesis.');
  }

  return () => ({
    SpeechGrammarList: window.SpeechGrammarList || window.webkitSpeechGrammarList,
    SpeechRecognition: window.SpeechRecognition || window.webkitSpeechRecognition,
    speechSynthesis: window.speechSynthesis,
    SpeechSynthesisUtterance: window.SpeechSynthesisUtterance
  });
}
