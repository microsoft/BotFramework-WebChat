export type Action = () => void

export type Func<T, TResult> = (item: T) => TResult;

export interface ISpeechRecognizer {
    locale: string;
    isStreamingToService: boolean;
    referenceGrammarId: string; // unique identifier to send to the speech implementation to bias SR to this scenario

    onIntermediateResult: Func<string, void>;
    onFinalResult: Func<string, void>;
    onAudioStreamingToService: Action;

    warmup(): void;
    startRecognizing(): void;
    stopRecognizing(): void;
}

export interface ISpeechSynthesizer {
    speak(text: string, lang: string, onSpeakingStarted: Action, onspeakingFinished: Action): void;
    stopSpeaking(): void;
}