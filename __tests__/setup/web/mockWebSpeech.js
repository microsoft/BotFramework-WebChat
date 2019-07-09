const { defineEventAttribute } = (EventTarget = window.EventTargetShim);
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
  const consumers = [];
  const jobs = [];

  return {
    cancel() {
      jobs.splice(0);
    },
    consume(consumer) {
      consumers.push(consumer);
      jobs.length && consumers.shift()(...jobs.shift());
    },
    hasConsumer() {
      return !!consumers.length;
    },
    hasJob() {
      return !!jobs.length;
    },
    peek() {
      return jobs[0];
    },
    produce(...args) {
      jobs.push(args);
      consumers.length && consumers.shift()(...jobs.shift());
    }
  };
}

const speechRecognitionBroker = createProducerConsumer();
const speechSynthesisBroker = createProducerConsumer();

class SpeechRecognition extends EventTarget {
  constructor() {
    super();

    this.grammars = null;
    this.lang = 'en-US';
    this.continuous = false;
    this.interimResults = false;
    this.maxAlternatives = 1;
    this.serviceURI = 'mock://microsoft.com/web-speech-recognition';

    this.abort = this.stop = NULL_FN;
  }

  start() {
    speechRecognitionBroker.consume((command, ...args) => {
      this[command](...args);
    });
  }

  microphoneMuted() {
    this.abort = this.stop = NULL_FN;

    this.dispatchEvent({ type: 'start' });
    this.dispatchEvent({ type: 'audiostart' });
    this.dispatchEvent({ type: 'audioend' });
    this.dispatchEvent({ type: 'error', error: 'no-speech' });
    this.dispatchEvent({ type: 'end' });
  }

  birdTweet() {
    this.abort = this.stop = NULL_FN;

    this.dispatchEvent({ type: 'start' });
    this.dispatchEvent({ type: 'audiostart' });
    this.dispatchEvent({ type: 'soundstart' });
    this.dispatchEvent({ type: 'soundend' });
    this.dispatchEvent({ type: 'audioend' });
    this.dispatchEvent({ type: 'end' });
  }

  unrecognizableSpeech() {
    this.abort = this.stop = NULL_FN;

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
    this.abort = this.stop = NULL_FN;

    this.dispatchEvent({ type: 'start' });
    this.dispatchEvent({ type: 'audiostart' });
    this.dispatchEvent({ type: 'audioend' });
    this.dispatchEvent({ type: 'error', error: 'network' });
    this.dispatchEvent({ type: 'end' });
  }

  accessDenied() {
    this.abort = this.stop = NULL_FN;

    this.dispatchEvent({ type: 'error', error: 'not-allowed' });
    this.dispatchEvent({ type: 'end' });
  }

  abortAfterAudioStart() {
    this.abort = () => {
      this.dispatchEvent({ type: 'audioend' });
      this.dispatchEvent({ type: 'error', error: 'aborted' });
      this.dispatchEvent({ type: 'end' });
    };

    this.stop = NULL_FN;

    this.dispatchEvent({ type: 'start' });
    this.dispatchEvent({ type: 'audiostart' });
  }

  recognize(transcript) {
    this.abort = this.stop = NULL_FN;

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

    this.stop = NULL_FN;

    this.dispatchEvent({ type: 'start' });
    this.dispatchEvent({ type: 'audiostart' });
    this.dispatchEvent({ type: 'soundstart' });
    this.dispatchEvent({ type: 'speechstart' });
    this.interimResults &&
      this.dispatchEvent({ type: 'result', results: createSpeechRecognitionResults(false, transcript) });
  }

  recognizeButNotConfident(transcript) {
    this.abort = this.stop = NULL_FN;

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

[
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
].forEach(name => defineEventAttribute(SpeechRecognition.prototype, name));

class SpeechGrammarList {
  addFromString() {
    throw new Error('Not implemented');
  }

  addFromURI() {
    throw new Error('Not implemented');
  }
}

const SPEECH_SYNTHESIS_VOICES = [
  {
    default: true,
    lang: 'en-US',
    localService: true,
    name: 'Mock Voice',
    voiceURI: 'mock://web-speech/voice'
  }
];

class SpeechSynthesis extends EventTarget {
  getVoices() {
    return SPEECH_SYNTHESIS_VOICES;
  }

  cancel() {
    speechSynthesisBroker.cancel();
  }

  pause() {
    throw new Error('pause is not implemented.');
  }

  resume() {
    throw new Error('resume is not implemented.');
  }

  speak(utterance) {
    speechSynthesisBroker.produce(utterance);
  }
}

defineEventAttribute(SpeechSynthesis.prototype, 'voiceschanged');

class SpeechSynthesisUtterance extends EventTarget {
  constructor(text) {
    super();

    this.lang = SPEECH_SYNTHESIS_VOICES[0].lang;
    this.pitch = 1;
    this.rate = 1;
    this.text = text;
    this.voice = SPEECH_SYNTHESIS_VOICES[0];
    this.volume = 1;
  }
}

['boundary', 'end', 'error', 'mark', 'pause', 'resume', 'start'].forEach(name =>
  defineEventAttribute(SpeechSynthesisUtterance.prototype, name)
);

window.WebSpeechMock = {
  hasPendingUtterance() {
    return speechSynthesisBroker.hasJob();
  },

  isRecognizing() {
    return speechRecognitionBroker.hasConsumer();
  },

  mockEndSynthesize() {
    return new Promise(resolve => {
      speechSynthesisBroker.consume(utterance => {
        utterance.dispatchEvent({ type: 'end' });

        const { lang, pitch, rate, text, voice, volume } = utterance;

        resolve({ lang, pitch, rate, text, voice, volume });
      });
    });
  },

  mockRecognize(...args) {
    speechRecognitionBroker.produce(...args);
  },

  mockStartSynthesize() {
    const [utterance] = speechSynthesisBroker.peek() || [];

    if (!utterance) {
      throw new Error('No utterance pending synthesize.');
    }

    utterance.dispatchEvent({ type: 'start' });

    const { lang, pitch, rate, text, voice, volume } = utterance;

    return { lang, pitch, rate, text, voice, volume };
  },

  SpeechGrammarList,
  SpeechRecognition,
  speechSynthesis: new SpeechSynthesis(),
  SpeechSynthesisUtterance
};
