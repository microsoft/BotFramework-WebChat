import { type WebSpeechPonyfill } from './WebSpeechPonyfill';

type WebSpeechPonyfillFactory = ({ referenceGrammarID }: { referenceGrammarID?: string }) => WebSpeechPonyfill;

export { type WebSpeechPonyfillFactory };
