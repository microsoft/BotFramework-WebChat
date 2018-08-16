import * as CognitiveSpeech from 'microsoft-speech-browser-sdk/Speech.Browser.Sdk';
import updateIn from 'simple-update-in';
import * as konsole from '../Konsole';
import { Action, Func, Speech } from '../SpeechModule';

export interface ISpeechContextDgiGroup {
    Type: string;
    Hints?: { ReferenceGrammar: string };
    Items?: Array<{ Text: string }>;
}

export interface ISpeechContext {
    dgi: { Groups: ISpeechContextDgiGroup[] };
}

export interface ICognitiveServicesSpeechRecognizerProperties {
    locale?: string;
    subscriptionKey?: string;
    fetchCallback?: (authFetchEventId: string) => Promise<string>;
    fetchOnExpiryCallback?: (authFetchEventId: string) => Promise<string>;
}

export class SpeechRecognizer implements Speech.ISpeechRecognizer {
    public audioStreamStartInitiated: boolean = false;
    public isStreamingToService: boolean = false;
    public onIntermediateResult: Func<string, void> = null;
    public onFinalResult: Func<string, void> = null;
    public onAudioStreamingToService: Action = null;
    public onRecognitionFailed: Action = null;
    public locale: string = null;
    public referenceGrammarId: string;

    private actualRecognizer: any = null;
    private grammars: string[] = null;
    private properties: ICognitiveServicesSpeechRecognizerProperties;

    constructor(properties: ICognitiveServicesSpeechRecognizerProperties = {}) {
        this.properties = properties;
        const recognitionMode = CognitiveSpeech.RecognitionMode.Interactive;
        const format = CognitiveSpeech.SpeechResultFormat.Simple;
        const locale = properties.locale || 'en-US';

        const recognizerConfig = new CognitiveSpeech.RecognizerConfig(
            new CognitiveSpeech.SpeechConfig(
                new CognitiveSpeech.Context(
                    new CognitiveSpeech.OS(navigator.userAgent, 'Browser', null),
                    new CognitiveSpeech.Device('WebChat', 'WebChat', '1.0.00000'))),
            recognitionMode,        // Speech.RecognitionMode.Interactive  (Options - Interactive/Conversation/Dictation>)
            locale,                 // Supported laguages are specific to each recognition mode. Refer to docs.
            format
        );                // Speech.SpeechResultFormat.Simple (Options - Simple/Detailed)

        let authentication;
        if (properties.subscriptionKey) {
            authentication = new CognitiveSpeech.CognitiveSubscriptionKeyAuthentication(properties.subscriptionKey);
        } else if (properties.fetchCallback && properties.fetchOnExpiryCallback) {
            authentication = new CognitiveSpeech.CognitiveTokenAuthentication(
                (authFetchEventId: string) => {
                    const d = new CognitiveSpeech.Deferred<string>();
                    this.properties.fetchCallback(authFetchEventId).then(
                        value => d.Resolve(value),
                        err => d.Reject(err)
                    );
                    return d.Promise();
                },
                (authFetchEventId: string) => {
                    const d = new CognitiveSpeech.Deferred<string>();
                    this.properties.fetchOnExpiryCallback(authFetchEventId).then(
                        value => d.Resolve(value),
                        err => d.Reject(err)
                    );
                    return d.Promise();
                }
            );
        } else {
            throw new Error('Error: The CognitiveServicesSpeechRecognizer requires either a subscriptionKey or a fetchCallback and fetchOnExpiryCallback.');
        }

        if (
            window.navigator.getUserMedia
            || (window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia)
        ) {
            this.actualRecognizer = CognitiveSpeech.CreateRecognizer(recognizerConfig, authentication);
        } else {
            console.error('This browser does not support speech recognition');
        }
    }

    // tslint:disable-next-line:no-empty
    public warmup() {
    }

    public setGrammars(grammars: string[]) {
        this.grammars = grammars;
    }

    public async startRecognizing() {
        if (!this.actualRecognizer) {
            this.log('ERROR: no recognizer?');
            return;
        }
        const eventhandler = (event: any) => {
            this.log(event.Name);
            switch (event.Name) {
                case 'RecognitionTriggeredEvent':
                case 'ListeningStartedEvent':
                case 'SpeechStartDetectedEvent':
                case 'SpeechEndDetectedEvent':
                case 'SpeechDetailedPhraseEvent':
                case 'ConnectingToServiceEvent':
                    break;
                case 'RecognitionStartedEvent':
                    if (this.onAudioStreamingToService) {
                        this.onAudioStreamingToService();
                    }
                    this.isStreamingToService = true;
                    break;
                case 'SpeechHypothesisEvent':
                    const hypothesisEvent = event as CognitiveSpeech.SpeechHypothesisEvent;
                    this.log('Hypothesis Result: ' + hypothesisEvent.Result.Text);
                    if (this.onIntermediateResult) {
                        this.onIntermediateResult(hypothesisEvent.Result.Text);
                    }
                    break;
                case 'SpeechSimplePhraseEvent':
                    const simplePhraseEvent = event as CognitiveSpeech.SpeechSimplePhraseEvent;
                    if (CognitiveSpeech.RecognitionStatus[simplePhraseEvent.Result.RecognitionStatus] as any === CognitiveSpeech.RecognitionStatus.Success) {
                        if (this.onFinalResult) {
                            this.onFinalResult(simplePhraseEvent.Result.DisplayText);
                        }
                    } else {
                        if (this.onRecognitionFailed) {
                            this.onRecognitionFailed();
                        }
                        this.log('Recognition Status: ' + simplePhraseEvent.Result.RecognitionStatus.toString());
                    }
                    break;
                case 'RecognitionEndedEvent':
                    this.isStreamingToService = false;
                    break;
                default:
                    this.log(event.Name + ' is unexpected');
            }
        };

        let speechContext: ISpeechContext;

        if (this.referenceGrammarId) {
            speechContext = updateIn(speechContext, ['dgi', 'Groups'], (groups: any[] = []) => [...groups, {
                Type: 'Generic',
                Hints: { ReferenceGrammar: this.referenceGrammarId }
            }]);
        }

        if (this.grammars) {
            speechContext = updateIn(speechContext, ['dgi', 'Groups'], (groups: any[] = []) => [...groups, {
                Type: 'Generic',
                Items: this.grammars.map(grammar => ({ Text: grammar }))
            }]);
        }

        return this.actualRecognizer.Recognize(eventhandler, speechContext && JSON.stringify(speechContext));
    }

    public speechIsAvailable() {
        return this.actualRecognizer != null;
    }

    public async stopRecognizing() {
        if (this.actualRecognizer != null) {
            this.actualRecognizer.AudioSource.TurnOff();
        }

        this.isStreamingToService = false;

        return;
    }

    private log(message: string) {
        konsole.log('CognitiveServicesSpeechRecognizer: ' + message);
    }
}
