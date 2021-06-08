/* globals SpeechGrammarList, SpeechRecognition, SpeechSynthesis */

type WebSpeechPonyfill = {
  SpeechGrammarList?: typeof SpeechGrammarList;
  SpeechRecognition?: typeof SpeechRecognition;
  speechSynthesis?: SpeechSynthesis;
  SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance;
};

export default WebSpeechPonyfill;
