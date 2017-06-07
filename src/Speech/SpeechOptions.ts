import { ISpeechRecognizer, ISpeechSynthesizer } from './SpeechInterface';

export class SpeechOptions {
    public speechRecognizer: ISpeechRecognizer;
    public speechSynthesizer: ISpeechSynthesizer;
}