const { defineEventAttribute } = (EventTarget = window.EventTargetShim);

const SPEECH_RECOGNITION_EVENT_NAMES = [
  'audiostart',
  'audioend',
  'end',
  'error',
  'nomatch',
  'result',
  'soundstart',
  'soundend',
  'speechstart',
  'speechend',
  'start'
];

const NULL_FN = () => 0;

function createSpeechRecognitionResults(isFinal, transcript) {
  const results = [
    [
      {
        confidence: 0.9,
        transcript
      }
    ]
  ];

  results[0].isFinal = isFinal;

  return results;
}

class SpeechRecognition extends EventTarget {
  constructor() {
    super();

    this.grammars = null;
    this.lang = 'en-US';
    this.continuous = false;
    this.interimResults = false;
    this.maxAlternatives = 1;
    this.serviceURI = 'mock://microsoft.com/web-speech-recognition';

    this.start = this.stop = this.abort = NULL_FN;
  }

  microphoneMuted() {
    this.start = () => {
      this.dispatchEvent({ type: 'start' });
      this.dispatchEvent({ type: 'audiostart' });
      this.dispatchEvent({ type: 'audioend' });
      this.dispatchEvent({ type: 'error', error: 'no-speech' });
      this.dispatchEvent({ type: 'end' });
    };
  }

  birdTweet() {
    this.start = () => {
      this.dispatchEvent({ type: 'start' });
      this.dispatchEvent({ type: 'audiostart' });
      this.dispatchEvent({ type: 'soundstart' });
      this.dispatchEvent({ type: 'soundend' });
      this.dispatchEvent({ type: 'audioend' });
      this.dispatchEvent({ type: 'end' });
    };
  }

  unrecognizableSpeech() {
    this.start = () => {
      this.dispatchEvent({ type: 'start' });
      this.dispatchEvent({ type: 'audiostart' });
      this.dispatchEvent({ type: 'soundstart' });
      this.dispatchEvent({ type: 'speechstart' });
      this.dispatchEvent({ type: 'speechend' });
      this.dispatchEvent({ type: 'soundend' });
      this.dispatchEvent({ type: 'audioend' });
      this.dispatchEvent({ type: 'end' });
    };
  }

  airplaneMode() {
    this.start = () => {
      this.dispatchEvent({ type: 'start' });
      this.dispatchEvent({ type: 'audiostart' });
      this.dispatchEvent({ type: 'audioend' });
      this.dispatchEvent({ type: 'error', error: 'network' });
      this.dispatchEvent({ type: 'end' });
    };
  }

  accessDenied() {
    this.start = () => {
      this.dispatchEvent({ type: 'error', error: 'not-allowed' });
      this.dispatchEvent({ type: 'end' });
    };
  }

  abortAfterAudioStart() {
    this.start = () => {
      this.dispatchEvent({ type: 'start' });
      this.dispatchEvent({ type: 'audiostart' });
    };

    this.abort = () => {
      this.dispatchEvent({ type: 'audioend' });
      this.dispatchEvent({ type: 'error', error: 'aborted' });
      this.dispatchEvent({ type: 'end' });
    };
  }

  recognize(transcript) {
    this.start = () => {
      this.dispatchEvent({ type: 'start' });
      this.dispatchEvent({ type: 'audiostart' });
      this.dispatchEvent({ type: 'soundstart' });
      this.dispatchEvent({ type: 'speechstart' });

      this.interimResults &&
        this.dispatchEvent({ type: 'result', results: createSpeechRecognitionResults(false, transcript) });

      this.dispatchEvent({ type: 'speechend' });
      this.dispatchEvent({ type: 'soundend' });
      this.dispatchEvent({ type: 'audioend' });

      this.dispatchEvent({ type: 'result', results: createSpeechRecognitionResults(true, transcript) });
      this.dispatchEvent({ type: 'end' });
    };
  }

  recognizeButAborted(transcript) {
    this.start = () => {
      this.dispatchEvent({ type: 'start' });
      this.dispatchEvent({ type: 'audiostart' });
      this.dispatchEvent({ type: 'soundstart' });
      this.dispatchEvent({ type: 'speechstart' });
      this.interimResults &&
        this.dispatchEvent({ type: 'result', results: createSpeechRecognitionResults(false, transcript) });
    };

    this.abort = () => {
      this.dispatchEvent({ type: 'speechend' });
      this.dispatchEvent({ type: 'soundend' });
      this.dispatchEvent({ type: 'audioend' });
      this.dispatchEvent({ type: 'error', error: 'aborted' });
      this.dispatchEvent({ type: 'end' });
    };
  }

  recognizeButNotConfident(transcript) {
    this.start = () => {
      this.dispatchEvent({ type: 'start' });
      this.dispatchEvent({ type: 'audiostart' });
      this.dispatchEvent({ type: 'soundstart' });
      this.dispatchEvent({ type: 'speechstart' });
      this.interimResults &&
        this.dispatchEvent({ type: 'result', results: createSpeechRecognitionResults(false, transcript) });
      this.dispatchEvent({ type: 'speechend' });
      this.dispatchEvent({ type: 'soundend' });
      this.dispatchEvent({ type: 'audioend' });
      this.dispatchEvent({ type: 'result', results: createSpeechRecognitionResults(false, transcript) });
      this.dispatchEvent({ type: 'end' });
    };
  }
}

SPEECH_RECOGNITION_EVENT_NAMES.forEach(name => defineEventAttribute(SpeechRecognition.prototype, name));

class SpeechGrammarList {
  addFromString() {
    throw new Error('Not implemented');
  }

  addFromURI() {
    throw new Error('Not implemented');
  }
}

window.createMockWebSpeechPonyfill = ({ setupSpeechRecognition }) => {
  class SpeechRecognitionWithScenario extends SpeechRecognition {
    constructor() {
      super();

      setupSpeechRecognition(this);
    }
  }

  return {
    SpeechGrammarList,
    SpeechRecognition: SpeechRecognitionWithScenario
  };
};
