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
    consume(fn, context) {
      consumers.push({ fn, context });
      jobs.length && consumers.shift().fn(...jobs.shift());
    },
    hasConsumer() {
      return !!consumers.length && consumers[0].context;
    },
    hasJob() {
      return !!jobs.length;
    },
    peek() {
      return jobs[0];
    },
    produce(...args) {
      jobs.push(args);
      consumers.length && consumers.shift().fn(...jobs.shift());
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
    speechRecognitionBroker.consume((scenario, ...args) => {
      if (!this[scenario]) {
        throw new Error(`Cannot find speech scenario named "${scenario}" in mockWebSpeech.js`);
      } else {
        this[scenario](...args);
      }
    }, this);
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

  recognizing(transcript) {
    this.abort = this.stop = NULL_FN;

    this.dispatchEvent({ type: 'start' });
    this.dispatchEvent({ type: 'audiostart' });
    this.dispatchEvent({ type: 'soundstart' });
    this.dispatchEvent({ type: 'speechstart' });

    this.interimResults &&
      this.dispatchEvent({ type: 'result', results: createSpeechRecognitionResults(false, transcript) });
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
    name: 'Mock Voice (en-US)',
    voiceURI: 'mock://web-speech/voice/en-US'
  },
  {
    default: false,
    lang: 'zh-YUE',
    localService: true,
    name: 'Mock Voice (zh-YUE)',
    voiceURI: 'mock://web-speech/voice/zh-YUE'
  }
];

class SpeechSynthesis extends EventTarget {
  constructor() {
    super();

    this.ignoreFirstUtteranceIfEmpty = true;
  }

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
    // We prime the speech engine by sending an empty utterance on start.
    // We should ignore the first utterance if it is empty.
    if (!this.ignoreFirstUtteranceIfEmpty || utterance.text) {
      speechSynthesisBroker.produce(utterance);
    }

    this.ignoreFirstUtteranceIfEmpty = false;
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
  mockEndSynthesize() {
    return new Promise(resolve => {
      speechSynthesisBroker.consume(utterance => {
        utterance.dispatchEvent({ type: 'end' });

        const { lang, pitch, rate, text, voice, volume } = utterance;

        resolve({ lang, pitch, rate, text, voice, volume });
      });
    });
  },

  mockErrorSynthesize(error = 'artificial-error') {
    return new Promise(resolve => {
      speechSynthesisBroker.consume(utterance => {
        utterance.dispatchEvent({ error, type: 'error' });

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

  speechRecognitionStartCalled() {
    const context = speechRecognitionBroker.hasConsumer();

    if (context) {
      const { continuous, grammars, interimResults, lang, maxAlternatives, serviceURI } = context;

      return {
        continuous,
        grammars,
        interimResults,
        lang,
        maxAlternatives,
        serviceURI
      };
    } else {
      return false;
    }
  },

  speechSynthesisUtterancePended() {
    return speechSynthesisBroker.hasJob();
  },

  SpeechGrammarList,
  SpeechRecognition,
  speechSynthesis: new SpeechSynthesis(),
  SpeechSynthesisUtterance
};
