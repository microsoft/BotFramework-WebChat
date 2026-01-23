import { useRef, useCallback, useMemo } from 'react';
import usePonyfill from '../../Ponyfill/usePonyfill';

// Minimum AudioWorkletProcessor definition for TypeScript recognition
// adding reference of worker does not work
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor(options?: AudioWorkletNodeOptions);
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}
declare function registerProcessor(name: string, processorCtor: typeof AudioWorkletProcessor): void;

/**
 * CSP Compliant: check __tests__/html2/speechToSpeech/csp.recording.html for CSP compliance tests.
 */
const audioProcessorCode = `(${function () {
  type RecorderState = { recording: boolean; buffer: number[]; bufferSize: number };
  class AudioRecorderProcessor extends AudioWorkletProcessor {
    constructor(options: AudioWorkletNodeOptions) {
      super();
      const state: RecorderState = {
        recording: false,
        buffer: [],
        bufferSize: options.processorOptions.bufferSize
      };
      Object.assign(this, state);

      this.port.onmessage = (e: MessageEvent) => {
        const state = this as unknown as RecorderState;
        if (e.data.command === 'START') {
          state.recording = true;
        } else if (e.data.command === 'STOP') {
          state.recording = false;
          state.buffer = [];
        }
      };
    }

    sendBuffer() {
      const { buffer, bufferSize } = this as unknown as RecorderState;
      while (buffer.length >= bufferSize) {
        const chunk = buffer.splice(0, bufferSize);
        this.port.postMessage({ eventType: 'audio', audioData: new Float32Array(chunk) });
      }
    }

    process(inputs: Float32Array[][]) {
      const state = this as unknown as RecorderState;
      if (inputs[0]?.length && state.recording) {
        state.buffer.push(...inputs[0][0]);
        if (state.buffer.length >= state.bufferSize) {
          this.sendBuffer();
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
        sampleRate: DEFAULT_SAMPLE_RATE,
        echoCancellation: true
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
