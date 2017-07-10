import { Func, Action, Speech } from "../../built/SpeechModule"

class MockSpeechRecognizer implements Speech.ISpeechRecognizer {
    locale: string = "en-US";
    isStreamingToService: boolean = false;
    referenceGrammarId: string = "mock";

    onIntermediateResult: Func<string, void> = null;
    onFinalResult: Func<string, void> = null;
    onAudioStreamingToService: Action = null;
    onRecognitionFailed: Action = null;

    warmup(): void { }
    startRecognizing(): void {
        // This will advance to Listening_Start state from Listening_Starting
        if (this.onAudioStreamingToService) {
            this.onAudioStreamingToService();
        }
    }
    stopRecognizing(): void { }
    speechIsAvailable(): boolean {
        return true;
    }
}

class MockSpeechSynthesizer implements Speech.ISpeechSynthesizer {
    speak(text: string, lang: string, onSpeakingStarted: Action, onspeakingFinished: Action): void { }
    stopSpeaking(): void { }
}