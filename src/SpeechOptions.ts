import { SpeechRecognition } from './SpeechRecognition';
import { SpeechSynthesis } from './SpeechSynthesis';

export class SpeechOptions {
    public speechRecognizer : SpeechRecognition.ISpeechRecognizer;
    public speechSynthesizer : SpeechSynthesis.ISpeechSynthesizer;
}