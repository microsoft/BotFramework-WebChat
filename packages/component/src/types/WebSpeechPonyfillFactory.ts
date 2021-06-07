import WebSpeechPonyfill from './WebSpeechPonyfill';

type WebSpeechPonyfillFactory = ({ referenceGrammarID }: { referenceGrammarID?: string }) => WebSpeechPonyfill;

export default WebSpeechPonyfillFactory;
