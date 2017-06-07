import { Speech, Func, Action } from '../SpeechModule'
import * as CognitiveSpeech from 'microsoft-speech-browser-sdk/Speech.Browser.Sdk'

//TODO: Cognitive services speech synthesis is coming later
export class SpeechSynthesizer implements Speech.ISpeechSynthesizer {
    speak(text: string, lang: string, onSpeakingStarted: Action, onspeakingFinished: Action): void {
        throw new Error('Method not implemented.');
    }
    stopSpeaking(): void {
        throw new Error('Method not implemented.');
    }
}