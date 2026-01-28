/* global clearInterval, MessageChannel, navigator, setInterval, URL, window */

/**
 * Mocks browser audio APIs for speechToSpeech testing.
 *
 * - Intercepts AudioContext.audioWorklet.addModule() to prevent blob execution
 * - Mocks AudioWorkletNode for the 'audio-recorder' processor
 * - Mocks navigator.mediaDevices.getUserMedia() to return a test audio stream
 */
export function setupMockMediaDevices() {
  const OriginalAudioContext = window.AudioContext;

  // Intercept AudioContext to mock audioWorklet.addModule
  window.AudioContext = function (options) {
    const ctx = new OriginalAudioContext(options);

    ctx.audioWorklet.addModule = url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      return Promise.resolve();
    };

    return ctx;
  };

  Object.setPrototypeOf(window.AudioContext, OriginalAudioContext);
  window.AudioContext.prototype = OriginalAudioContext.prototype;

  // Mock AudioWorkletNode - uses GainNode as base so source.connect() works
  window.AudioWorkletNode = function (context, name, options) {
    const node = context.createGain();
    const channel = new MessageChannel();
    let recording = false;
    let intervalId = null;

    node.port = channel.port1;

    // port1 is exposed as worklet.port to the real code
    // Real code sends to port1 → received by port2.onmessage (commands)
    // Mock sends from port2 → received by port1.onmessage (audio chunks)
    channel.port2.onmessage = ({ data }) => {
      if (data.command === 'START') {
        recording = true;
        const bufferSize = options?.processorOptions?.bufferSize || 2400;

        // Send chunks at ~100ms intervals while recording
        // Use port2.postMessage so port1.onmessage (set by real code) receives it
        intervalId = setInterval(() => {
          if (recording) {
            channel.port2.postMessage({ eventType: 'audio', audioData: new Float32Array(bufferSize) });
          }
        }, 100);
      } else if (data.command === 'STOP') {
        recording = false;
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };

    return node;
  };

  // Mock getUserMedia with oscillator-based test stream
  navigator.mediaDevices.getUserMedia = constraints => {
    const sampleRate = constraints?.audio?.sampleRate || 24000;
    const ctx = new OriginalAudioContext({ sampleRate });
    const oscillator = ctx.createOscillator();
    const destination = ctx.createMediaStreamDestination();

    oscillator.connect(destination);
    oscillator.start();

    destination.stream.getTracks().forEach(track => {
      const originalStop = track.stop.bind(track);
      track.stop = () => {
        oscillator.stop();
        ctx.close();
        originalStop();
      };
    });

    return Promise.resolve(destination.stream);
  };
}
