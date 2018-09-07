export default function () {
  return () => ({
    SpeechGrammarList: window.SpeechGrammarList || window.webkitSpeechGrammarList,
    SpeechRecognition: window.SpeechRecognition || window.webkitSpeechRecognition,
    speechSynthesis: window.speechSynthesis,
    SpeechSynthesisUtterance: window.SpeechSynthesisUtterance
  });
}
