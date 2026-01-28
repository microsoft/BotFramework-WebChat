import { useRef, useCallback, useMemo } from 'react';
import usePonyfill from '../../Ponyfill/usePonyfill';

// Minimum AudioWorkletProcessor definition for TypeScript recognition
// adding reference of worker does not work
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  recording: boolean;
  buffer: number[];
  bufferSize: number;
  constructor(options?: AudioWorkletNodeOptions);
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}
declare function registerProcessor(name: string, processorCtor: typeof AudioWorkletProcessor): void;

/**
 * CSP Compliant: check __tests__/html2/speechToSpeech/csp.recording.html for CSP compliance tests.
 * NOTE: This code is stringified and run in an AudioWorklet context, so it must be plain JavaScript
 * without any TypeScript annotations that could be transformed by the compiler.
 */
const audioProcessorCode = `(${function () {
  class AudioRecorderProcessor extends AudioWorkletProcessor {
    constructor(options: AudioWorkletNodeOptions) {
      super();
      this.buffer = [];
      this.bufferSize = options.processorOptions.bufferSize;
      this.recording = false;

      this.port.onmessage = e => {
        if (e.data.command === 'START') {
          this.recording = true;
        } else if (e.data.command === 'STOP') {
          this.recording = false;
          this.buffer = [];
        }
      };
    }

    process(inputs: Float32Array[][]) {
      if (inputs[0] && inputs[0].length && this.recording) {
        this.buffer.push(...inputs[0][0]);
        while (this.buffer.length >= this.bufferSize) {
          const chunk = this.buffer.splice(0, this.bufferSize);
          this.port.postMessage({ eventType: 'audio', audioData: new Float32Array(chunk) });
        }
      }
      return true;
    }
  }

  registerProcessor('audio-recorder', AudioRecorderProcessor);
}})()`;

const INT16_MIN = -32768;
const INT16_MAX = 32767;
const INT16_SCALE = 32767;
const DEFAULT_SAMPLE_RATE = 24000;
const DEFAULT_CHUNK_SIZE_IN_MS = 100;
const MS_IN_SECOND = 1000;

export function useRecorder(onAudioChunk: (base64: string, timestamp: string) => void) {
  const audioCtxRef = useRef<AudioContext | undefined>(undefined);
  const workletRef = useRef<AudioWorkletNode | undefined>(undefined);
  const streamRef = useRef<MediaStream | undefined>(undefined);
  const [{ Date }] = usePonyfill();

  const stopRecording = useCallback(() => {
    if (workletRef.current) {
      workletRef.current.port.postMessage({ command: 'STOP' });
      workletRef.current.disconnect();
      workletRef.current = undefined;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = undefined;
    }
  }, []);

  const initAudio = useCallback(async () => {
    if (audioCtxRef.current) {
      return;
    }
    const audioCtx = new AudioContext({ sampleRate: DEFAULT_SAMPLE_RATE });
    const blob = new Blob([audioProcessorCode], {
      type: 'application/javascript'
    });
    // eslint-disable-next-line no-restricted-properties
    const url = URL.createObjectURL(blob);
    await audioCtx.audioWorklet.addModule(url);
    URL.revokeObjectURL(url);
    // eslint-disable-next-line require-atomic-updates
    audioCtxRef.current = audioCtx;
  }, []);

  const startRecording = useCallback(async () => {
    await initAudio();
    const audioCtx = audioCtxRef.current!;
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        sampleRate: DEFAULT_SAMPLE_RATE
      }
    });
    streamRef.current = stream;
    const source = audioCtx.createMediaStreamSource(stream);
    const worklet = new AudioWorkletNode(audioCtx, 'audio-recorder', {
      processorOptions: {
        bufferSize: (DEFAULT_SAMPLE_RATE * DEFAULT_CHUNK_SIZE_IN_MS) / MS_IN_SECOND
      }
    });

    worklet.port.onmessage = e => {
      if (e.data.eventType === 'audio') {
        const timestamp = new Date().toISOString();
        const float32 = e.data.audioData;
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
          int16[+i] = Math.max(INT16_MIN, Math.min(INT16_MAX, float32.at(i) * INT16_SCALE));
        }
        const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
        onAudioChunk(base64, timestamp);
      }
    };

    source.connect(worklet);
    worklet.connect(audioCtx.destination);
    worklet.port.postMessage({ command: 'START' });
    workletRef.current = worklet;
  }, [Date, initAudio, onAudioChunk]);

  const record = useCallback(() => {
    startRecording();
    return stopRecording;
  }, [startRecording, stopRecording]);

  return useMemo(() => ({ record }), [record]);
}
