import { ISpeechRecognizer, ISpeechSynthesizer, Func, Action } from './SpeechInterface';

export class SpeechRecognizer {
    private static instance: ISpeechRecognizer = null;

    public static setSpeechRecognizer(recognizer: ISpeechRecognizer) {
        SpeechRecognizer.instance = recognizer;
    }

    public static startRecognizing(locale: string = 'en-US',
        onIntermediateResult: Func<string, void> = null,
        onFinalResult: Func<string, void> = null,
        onAudioStreamStarted: Action = null) {

        if (!SpeechRecognizer.speechIsAvailable())
            return;

        if (locale && SpeechRecognizer.instance.locale !== locale) {
            SpeechRecognizer.instance.stopRecognizing();
            SpeechRecognizer.instance.locale = locale; // to do this could invalidate warmup.
        }

        if (SpeechRecognizer.alreadyRecognizing()) {
            SpeechRecognizer.stopRecognizing();
        }

        SpeechRecognizer.instance.onIntermediateResult = onIntermediateResult;
        SpeechRecognizer.instance.onFinalResult = onFinalResult;
        SpeechRecognizer.instance.onAudioStreamingToService = onAudioStreamStarted;
        SpeechRecognizer.instance.startRecognizing();
    }

    public static stopRecognizing() {
        if (!SpeechRecognizer.speechIsAvailable())
            return;

        SpeechRecognizer.instance.stopRecognizing();
    }

    public static warmup() {
        if (!SpeechRecognizer.speechIsAvailable())
            return;

        SpeechRecognizer.instance.warmup();
    }

    public static speechIsAvailable() {
        return SpeechRecognizer.instance != null;
    }

    private static alreadyRecognizing() {
        return SpeechRecognizer.instance ? SpeechRecognizer.instance.isStreamingToService : false;
    }
}

export class SpeechSynthesizer {
    private static instance: ISpeechSynthesizer = null;

    public static setSpeechSynthesizer(speechSynthesizer: ISpeechSynthesizer) {
        SpeechSynthesizer.instance = speechSynthesizer;
    }

    public static speak(text: string, lang: string, onSpeakingStarted: Action = null, onSpeakingFinished: Action = null) {
        if (SpeechSynthesizer.instance == null)
            return;

        SpeechSynthesizer.instance.speak(text, lang, onSpeakingStarted, onSpeakingFinished);
    }

    public static stopSpeaking() {
        if (SpeechSynthesizer.instance == null)
            return;

        SpeechSynthesizer.instance.stopSpeaking();
    }
}