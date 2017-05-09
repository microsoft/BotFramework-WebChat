
import { AudioRecorder } from './AudioRecorder'
import { konsole } from './Chat';
import * as CognitiveSpeech from "microsoft-speech-browser-sdk/Speech.Browser.Sdk"

export type Action = () => void
export type Func<T, TResult> = (item: T) => TResult;

export class SpeechRecognizer {
    private static instance: SpeechRecognition.ISpeechRecognizer = null;

    public static setSpeechRecognizer(recognizer: SpeechRecognition.ISpeechRecognizer) {
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

export module SpeechRecognition {
    export interface ISpeechRecognizer {
        locale: string;
        isStreamingToService: boolean;
        referenceGrammarId: string; // unique identifier to send to the speech implementation to bias SR to this scenario

        onIntermediateResult: Func<string, void>;
        onFinalResult: Func<string, void>;
        onAudioStreamingToService: Action;

        warmup() : void;
        startRecognizing() : void;
        stopRecognizing() : void;
    }

    export class BrowserSpeechRecognizer implements ISpeechRecognizer {
        public locale: string = null;
        public isStreamingToService: boolean = false;
        public referenceGrammarId: string;

        public onIntermediateResult: Func<string, void> = null;
        public onFinalResult: Func<string, void> = null;
        public onAudioStreamingToService: Action = null;

        private recognizer: any = null;

        constructor() {
            this.recognizer = new (<any>window).webkitSpeechRecognition();

            if (this.recognizer == null)
                throw "Error: This browser does not support speech recognition";

            this.recognizer.lang = 'en-US';
            this.recognizer.interimResults = true;

            this.recognizer.onaudiostart = () => {
                if (this.onAudioStreamingToService) {
                    this.onAudioStreamingToService();
                }
            };

            this.recognizer.onresult = (srevent : any) => {
                if (srevent.results == null || srevent.length == 0)
                    return;

                const result = srevent.results[0];
                if (result.isFinal === true && this.onFinalResult != null) {
                    this.onFinalResult(result[0].transcript);
                } else if (result.isFinal === false && this.onIntermediateResult != null) {
                    let text = "";
                    for (let i = 0; i < srevent.results.length; ++i) {
                        text += srevent.results[i][0].transcript;
                    }
                    this.onIntermediateResult(text);
                }
            }

            this.recognizer.onerror = (err : any) => {
                throw err;
            }
        }

        public warmup() {

        }

        public startRecognizing() {
            this.recognizer.start();
        }

        public stopRecognizing() {
            this.recognizer.stop();
        }
    }

    export interface ICognitiveServicesSpeechRecognizerProperties {
        locale?: string,
        subscriptionKey?: string,
        fetchCallback?: (authFetchEventId: string) => Promise<string>,
        fetchOnExpiryCallback?: (authFetchEventId: string) => Promise<string>
    }

    export class CognitiveServicesSpeechRecognizer implements ISpeechRecognizer {
        public audioStreamStartInitiated: boolean = false;
        public isStreamingToService: boolean = false;
        public onIntermediateResult: Func<string, void> = null;
        public onFinalResult: Func<string, void> = null;
        public onAudioStreamingToService: Action = null;
        public locale: string = null;
        public referenceGrammarId: string;

        private actualRecognizer: any = null;
        private properties: ICognitiveServicesSpeechRecognizerProperties;

        constructor(properties: ICognitiveServicesSpeechRecognizerProperties = {}) {
            this.properties = properties;
            const recognitionMode = CognitiveSpeech.RecognitionMode.Interactive;
            const format = CognitiveSpeech.SpeechResultFormat.Simple;
            const locale = properties.locale || 'en-US';

            let recognizerConfig = new CognitiveSpeech.RecognizerConfig(
                new CognitiveSpeech.SpeechConfig(
                    new CognitiveSpeech.Context(
                        new CognitiveSpeech.OS(navigator.userAgent, "Browser", null),
                        new CognitiveSpeech.Device("WebChat", "WebChat", "1.0.00000"))),
                                recognitionMode,        // Speech.RecognitionMode.Interactive  (Options - Interactive/Conversation/Dictation>)
                                locale,                 // Supported laguages are specific to each recognition mode. Refer to docs.
                                format);                // Speech.SpeechResultFormat.Simple (Options - Simple/Detailed)

            let authentication;
            if (properties.subscriptionKey) {
                authentication = new CognitiveSpeech.CognitiveSubscriptionKeyAuthentication(properties.subscriptionKey);
            } else if (properties.fetchCallback && properties.fetchOnExpiryCallback) {
                authentication = new CognitiveSpeech.CognitiveTokenAuthentication(
                    (authFetchEventId: string) => {
                        let d = new CognitiveSpeech.Deferred<string>();
                        this.properties.fetchCallback(authFetchEventId).then(value => d.Resolve(value), err => d.Reject(err));
                        return d.Promise();    
                    },
                    (authFetchEventId: string) => {
                        let d = new CognitiveSpeech.Deferred<string>();
                        this.properties.fetchOnExpiryCallback(authFetchEventId).then(value => d.Resolve(value), err => d.Reject(err));
                        return d.Promise();    
                    });
            } else {
                throw 'Error: The CognitiveServicesSpeechRecognizer requires either a subscriptionKey or a fetchCallback and fetchOnExpiryCallback.';
            }

            this.actualRecognizer = CognitiveSpeech.CreateRecognizer(recognizerConfig, authentication);
        }

        public warmup() {
        }

        public startRecognizing() {
            if (!this.actualRecognizer) {
                this.log('ERROR: no recognizer?');
                return;
            }
            let eventhandler = (event : any) => {
                switch (event.Name) {
                    case 'RecognitionTriggeredEvent':
                        this.log('RecognitionTriggeredEvent');
                        break;
                    case 'ListeningStartedEvent':
                        this.log('ListeningStartedEvent');
                        break;
                    case 'RecognitionStartedEvent':
                        this.log('RecognitionStartedEvent');
                        if(this.onAudioStreamingToService) {
                            this.onAudioStreamingToService()
                        }
                        this.isStreamingToService = true;
                        break;
                    case 'SpeechStartDetectedEvent':
                        this.log('SpeechStartDetectedEvent');
                        break;
                    case 'SpeechHypothesisEvent':
                        let hypothesisEvent = event as CognitiveSpeech.SpeechHypothesisEvent;
                        this.log('SpeechHypothesisEvent: ' + hypothesisEvent.Result.Text);
                        if (this.onIntermediateResult) {
                            this.onIntermediateResult(hypothesisEvent.Result.Text);
                        }
                        break;
                    case 'SpeechEndDetectedEvent':
                        this.log('SpeechEndDetectedEvent');
                        break;
                    case 'SpeechSimplePhraseEvent':
                        this.log('SpeechSimplePhraseEvent');
                        let simplePhraseEvent = event as CognitiveSpeech.SpeechSimplePhraseEvent;
                        if (CognitiveSpeech.RecognitionStatus[simplePhraseEvent.Result.RecognitionStatus] as any === CognitiveSpeech.RecognitionStatus.Success) {
                            if (this.onFinalResult) {
                                this.onFinalResult(simplePhraseEvent.Result.DisplayText);
                            }
                        } else {
                            this.log('Recognition Status: ' + simplePhraseEvent.Result.RecognitionStatus.toString());
                        }
                        break;
                    case 'SpeechDetailedPhraseEvent':
                        this.log('SpeechDetailedPhraseEvent');
                        break;
                    case 'RecognitionEndedEvent' :
                        this.log('RecognitionEndedEvent');
                        this.isStreamingToService = false;
                        break;
                }
            }
            
            let speechContext = null;
            if(this.referenceGrammarId)
            {
                speechContext = JSON.stringify({
                    dgi:{
                        Groups: [
                            {
                                Type: "Generic",
                                Hints: { ReferenceGrammar: this.referenceGrammarId }
                            }
                        ]
                    }
                });
            }

            this.actualRecognizer.Recognize(eventhandler, speechContext);
        }

        public stopRecognizing() {
            if (this.actualRecognizer != null) {
                this.actualRecognizer.AudioSource.TurnOff();
            }
            this.isStreamingToService = false;
        }

        private log(message: string) {
            konsole.log('CognitiveServicesSpeechRecognizer: ' + message);
        }
    }
}
