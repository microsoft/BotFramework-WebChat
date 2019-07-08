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

function createProducerConsumer() {
  const queue = [];
  const consumers = [];

  return {
    cancel() {
      queue = [];
    },
    consume(consumer) {
      consumers.push(consumer);
      queue.length && consumers.shift()(...queue.shift());
    },
    hasConsumer() {
      return !!consumers.length;
    },
    peek() {
      return queue[0];
    },
    produce(...args) {
      queue.push(args);
      consumers.length && consumers.shift()(...queue.shift());
    }
  };
}

const speechRecognitionQueue = createProducerConsumer();
const speechSynthesisQueue = createProducerConsumer();

class SpeechRecognition extends EventTarget {
  constructor() {
    super();

    this.grammars = null;
    this.lang = 'en-US';
    this.continuous = false;
    this.interimResults = false;
    this.maxAlternatives = 1;
    this.serviceURI = 'mock://microsoft.com/web-speech-recognition';

    this.stop = this.abort = NULL_FN;
  }

  start() {
    speechRecognitionQueue.consume((command, ...args) => {
      this[command](...args);
    });
  }

  microphoneMuted() {
    this.dispatchEvent({ type: 'start' });
    this.dispatchEvent({ type: 'audiostart' });
    this.dispatchEvent({ type: 'audioend' });
    this.dispatchEvent({ type: 'error', error: 'no-speech' });
    this.dispatchEvent({ type: 'end' });
  }

  birdTweet() {
    this.dispatchEvent({ type: 'start' });
    this.dispatchEvent({ type: 'audiostart' });
    this.dispatchEvent({ type: 'soundstart' });
    this.dispatchEvent({ type: 'soundend' });
    this.dispatchEvent({ type: 'audioend' });
    this.dispatchEvent({ type: 'end' });
  }

  unrecognizableSpeech() {
    this.dispatchEvent({ type: 'start' });
    this.dispatchEvent({ type: 'audiostart' });
    this.dispatchEvent({ type: 'soundstart' });
    this.dispatchEvent({ type: 'speechstart' });
    this.dispatchEvent({ type: 'speechend' });
    this.dispatchEvent({ type: 'soundend' });
    this.dispatchEvent({ type: 'audioend' });
    this.dispatchEvent({ type: 'end' });
  }

  airplaneMode() {
    this.dispatchEvent({ type: 'start' });
    this.dispatchEvent({ type: 'audiostart' });
    this.dispatchEvent({ type: 'audioend' });
    this.dispatchEvent({ type: 'error', error: 'network' });
    this.dispatchEvent({ type: 'end' });
  }

  accessDenied() {
    this.dispatchEvent({ type: 'error', error: 'not-allowed' });
    this.dispatchEvent({ type: 'end' });
  }

  abortAfterAudioStart() {
    this.abort = () => {
      this.dispatchEvent({ type: 'audioend' });
      this.dispatchEvent({ type: 'error', error: 'aborted' });
      this.dispatchEvent({ type: 'end' });
    };

    this.dispatchEvent({ type: 'start' });
    this.dispatchEvent({ type: 'audiostart' });
  }

  recognize(transcript) {
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
  }

  recognizeButAborted(transcript) {
    this.abort = () => {
      this.dispatchEvent({ type: 'speechend' });
      this.dispatchEvent({ type: 'soundend' });
      this.dispatchEvent({ type: 'audioend' });
      this.dispatchEvent({ type: 'error', error: 'aborted' });
      this.dispatchEvent({ type: 'end' });
    };

    this.dispatchEvent({ type: 'start' });
    this.dispatchEvent({ type: 'audiostart' });
    this.dispatchEvent({ type: 'soundstart' });
    this.dispatchEvent({ type: 'speechstart' });
    this.interimResults &&
      this.dispatchEvent({ type: 'result', results: createSpeechRecognitionResults(false, transcript) });
  }

  recognizeButNotConfident(transcript) {
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

class SpeechSynthesis extends EventTarget {
  constructor() {
    super();

    this.voices = [
      {
        default: true,
        lang: 'en-US',
        localService: true,
        name: 'Mock Voice',
        voiceURI: 'mock://web-speech/voice'
      }
    ];
  }

  getVoices() {
    return this.voices;
  }

  cancel() {
    speechSynthesisQueue.cancel();
  }

  pause() {}
  resume() {}

  speak(utterance) {
    speechSynthesisQueue.produce(utterance);
  }
}

defineEventAttribute(SpeechSynthesis.prototype, 'vocieschanged');

class SpeechSynthesisUtterance extends EventTarget {
  constructor(text) {
    super();

    this.text = text;
  }
}

['boundary', 'end', 'error', 'mark', 'pause', 'resume', 'start'].forEach(name =>
  defineEventAttribute(SpeechSynthesisUtterance.prototype, name)
);

window.WebSpeechMock = {
  mockRecognize(...args) {
    speechRecognitionQueue.produce(...args);
  },

  mockSynthesize() {
    return new Promise(resolve => {
      speechSynthesisQueue.consume(utterance => {
        utterance.dispatchEvent({ type: 'start' });
        utterance.dispatchEvent({ type: 'end' });

        const { lang, pitch, rate, text, voice, volume } = utterance;

        resolve({ lang, pitch, rate, text, voice, volume });
      });
    });
  },

  peekSynthesize() {
    return speechSynthesisQueue.peek();
  },

  recognizing() {
    return speechRecognitionQueue.hasConsumer();
  },

  SpeechGrammarList,
  SpeechRecognition,
  speechSynthesis: new SpeechSynthesis(),
  SpeechSynthesisUtterance
};
