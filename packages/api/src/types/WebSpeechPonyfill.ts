/* globals SpeechGrammarList, SpeechRecognition, SpeechSynthesis */

type WebSpeechPonyfill = {
  resumeAudioContext?: () => Promise<void>;
  SpeechGrammarList?: typeof SpeechGrammarList;
  SpeechRecognition?: typeof SpeechRecognition;
  speechSynthesis?: SpeechSynthesis;
  SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance;
};

export default WebSpeechPonyfill;
