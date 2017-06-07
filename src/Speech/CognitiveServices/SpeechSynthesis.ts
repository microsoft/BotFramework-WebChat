import { ISpeechSynthesizer, Func, Action } from "../SpeechInterface"
import * as CognitiveSpeech from "microsoft-speech-browser-sdk/Speech.Browser.Sdk"

//TODO
export class SpeechSynthesizer implements ISpeechSynthesizer {
    speak(text: string, lang: string, onSpeakingStarted: Action, onspeakingFinished: Action): void {
        throw new Error('Method not implemented.');
    }
    stopSpeaking(): void {
        throw new Error('Method not implemented.');
    }
}