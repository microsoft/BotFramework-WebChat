"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CognitiveSpeech = require("microsoft-speech-browser-sdk/Speech.Browser.Sdk");
var simple_update_in_1 = require("simple-update-in");
var konsole = require("../Konsole");
var SpeechRecognizer = (function () {
    function SpeechRecognizer(properties) {
        if (properties === void 0) { properties = {}; }
        var _this = this;
        this.audioStreamStartInitiated = false;
        this.isStreamingToService = false;
        this.onIntermediateResult = null;
        this.onFinalResult = null;
        this.onAudioStreamingToService = null;
        this.onRecognitionFailed = null;
        this.locale = null;
        this.actualRecognizer = null;
        this.grammars = null;
        this.properties = properties;
        var recognitionMode = CognitiveSpeech.RecognitionMode.Interactive;
        var format = CognitiveSpeech.SpeechResultFormat.Simple;
        var locale = properties.locale || 'en-US';
        var recognizerConfig = new CognitiveSpeech.RecognizerConfig(new CognitiveSpeech.SpeechConfig(new CognitiveSpeech.Context(new CognitiveSpeech.OS(navigator.userAgent, 'Browser', null), new CognitiveSpeech.Device('WebChat', 'WebChat', '1.0.00000'))), recognitionMode, // Speech.RecognitionMode.Interactive  (Options - Interactive/Conversation/Dictation>)
        locale, // Supported laguages are specific to each recognition mode. Refer to docs.
        format); // Speech.SpeechResultFormat.Simple (Options - Simple/Detailed)
        var authentication;
        if (properties.subscriptionKey) {
            authentication = new CognitiveSpeech.CognitiveSubscriptionKeyAuthentication(properties.subscriptionKey);
        }
        else if (properties.fetchCallback && properties.fetchOnExpiryCallback) {
            authentication = new CognitiveSpeech.CognitiveTokenAuthentication(function (authFetchEventId) {
                var d = new CognitiveSpeech.Deferred();
                _this.properties.fetchCallback(authFetchEventId).then(function (value) { return d.Resolve(value); }, function (err) { return d.Reject(err); });
                return d.Promise();
            }, function (authFetchEventId) {
                var d = new CognitiveSpeech.Deferred();
                _this.properties.fetchOnExpiryCallback(authFetchEventId).then(function (value) { return d.Resolve(value); }, function (err) { return d.Reject(err); });
                return d.Promise();
            });
        }
        else {
            throw new Error('Error: The CognitiveServicesSpeechRecognizer requires either a subscriptionKey or a fetchCallback and fetchOnExpiryCallback.');
        }
        if (window.navigator.getUserMedia
            || (window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia)) {
            this.actualRecognizer = CognitiveSpeech.CreateRecognizer(recognizerConfig, authentication);
        }
        else {
            console.error('This browser does not support speech recognition');
        }
    }
    // tslint:disable-next-line:no-empty
    SpeechRecognizer.prototype.warmup = function () {
    };
    SpeechRecognizer.prototype.setGrammars = function (grammars) {
        this.grammars = grammars;
    };
    SpeechRecognizer.prototype.startRecognizing = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var eventhandler, speechContext;
            return tslib_1.__generator(this, function (_a) {
                if (!this.actualRecognizer) {
                    this.log('ERROR: no recognizer?');
                    return [2 /*return*/];
                }
                eventhandler = function (event) {
                    _this.log(event.Name);
                    switch (event.Name) {
                        case 'RecognitionTriggeredEvent':
                        case 'ListeningStartedEvent':
                        case 'SpeechStartDetectedEvent':
                        case 'SpeechEndDetectedEvent':
                        case 'SpeechDetailedPhraseEvent':
                        case 'ConnectingToServiceEvent':
                            break;
                        case 'RecognitionStartedEvent':
                            if (_this.onAudioStreamingToService) {
                                _this.onAudioStreamingToService();
                            }
                            _this.isStreamingToService = true;
                            break;
                        case 'SpeechHypothesisEvent':
                            var hypothesisEvent = event;
                            _this.log('Hypothesis Result: ' + hypothesisEvent.Result.Text);
                            if (_this.onIntermediateResult) {
                                _this.onIntermediateResult(hypothesisEvent.Result.Text);
                            }
                            break;
                        case 'SpeechSimplePhraseEvent':
                            var simplePhraseEvent = event;
                            if (CognitiveSpeech.RecognitionStatus[simplePhraseEvent.Result.RecognitionStatus] === CognitiveSpeech.RecognitionStatus.Success) {
                                if (_this.onFinalResult) {
                                    _this.onFinalResult(simplePhraseEvent.Result.DisplayText);
                                }
                            }
                            else {
                                if (_this.onRecognitionFailed) {
                                    _this.onRecognitionFailed();
                                }
                                _this.log('Recognition Status: ' + simplePhraseEvent.Result.RecognitionStatus.toString());
                            }
                            break;
                        case 'RecognitionEndedEvent':
                            _this.isStreamingToService = false;
                            break;
                        default:
                            _this.log(event.Name + ' is unexpected');
                    }
                };
                if (this.referenceGrammarId) {
                    speechContext = simple_update_in_1.default(speechContext, ['dgi', 'Groups'], function (groups) {
                        if (groups === void 0) { groups = []; }
                        return groups.concat([{
                                Type: 'Generic',
                                Hints: { ReferenceGrammar: _this.referenceGrammarId }
                            }]);
                    });
                }
                if (this.grammars) {
                    speechContext = simple_update_in_1.default(speechContext, ['dgi', 'Groups'], function (groups) {
                        if (groups === void 0) { groups = []; }
                        return groups.concat([{
                                Type: 'Generic',
                                Items: _this.grammars.map(function (grammar) { return ({ Text: grammar }); })
                            }]);
                    });
                }
                return [2 /*return*/, this.actualRecognizer.Recognize(eventhandler, speechContext && JSON.stringify(speechContext))];
            });
        });
    };
    SpeechRecognizer.prototype.speechIsAvailable = function () {
        return this.actualRecognizer != null;
    };
    SpeechRecognizer.prototype.stopRecognizing = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                if (this.actualRecognizer != null) {
                    this.actualRecognizer.AudioSource.TurnOff();
                }
                this.isStreamingToService = false;
                return [2 /*return*/];
            });
        });
    };
    SpeechRecognizer.prototype.log = function (message) {
        konsole.log('CognitiveServicesSpeechRecognizer: ' + message);
    };
    return SpeechRecognizer;
}());
exports.SpeechRecognizer = SpeechRecognizer;
//# sourceMappingURL=SpeechRecognition.js.map