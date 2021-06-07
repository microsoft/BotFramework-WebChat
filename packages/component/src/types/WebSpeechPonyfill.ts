type WebSpeechPonyfill = {
  SpeechGrammarList?: typeof window.SpeechGrammarList;
  SpeechRecognition?: typeof window.SpeechRecognition;
  speechSynthesis?: window.SpeechSynthesis;
  SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance;
};

export default WebSpeechPonyfill;
