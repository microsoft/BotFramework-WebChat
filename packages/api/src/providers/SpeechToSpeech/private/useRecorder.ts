import { useRef, useCallback, useMemo } from 'react';
import useCapabilities from '../../Capabilities/useCapabilities';
import usePonyfill from '../../Ponyfill/usePonyfill';

// Minimum AudioWorkletProcessor definition for TypeScript recognition
// adding reference of worker does not work
declare class AudioWorkletProcessor {
  buffer: number[];
  bufferSize: number;
  constructor(options?: AudioWorkletNodeOptions);
  muted: boolean;
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
  readonly port: MessagePort;
  recording: boolean;
  silentFrame: Float32Array;
}
declare function registerProcessor(name: string, processorCtor: typeof AudioWorkletProcessor): void;

/**
 * CSP Compliant: check __tests__/html2/speechToSpeech/csp.recording.html for CSP compliance tests.
 * NOTE: This code is stringified and run in an AudioWorklet context, so it must be plain JavaScript
 * without any TypeScript annotations that could be transformed by the compiler.
 */
const audioProcessorCode = `(${function () {
  const RENDER_QUANTUM = 128;

  class AudioRecorderProcessor extends AudioWorkletProcessor {
    constructor(options: AudioWorkletNodeOptions) {
      super();
      this.buffer = [];
      this.bufferSize = options.processorOptions.bufferSize;
      this.muted = false;
      this.recording = false;
      this.silentFrame = new Float32Array(RENDER_QUANTUM); // Pre-allocated zeros

      this.port.onmessage = e => {
        if (e.data.command === 'START') {
          this.recording = true;
        } else if (e.data.command === 'STOP') {
          this.recording = false;
          this.buffer = [];
        } else if (e.data.command === 'MUTE') {
          this.muted = true;
        } else if (e.data.command === 'UNMUTE') {
          this.muted = false;
        }
      };
    }

    process(inputs: Float32Array[][]) {
      if (this.recording) {
        // Use real audio when not muted, otherwise silenced chunk to keep connection alive (all zeros).
        const audioData = !this.muted && inputs[0] && inputs[0].length ? inputs[0][0] : this.silentFrame;
        this.buffer.push(...audioData);

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
  const [{ Date }] = usePonyfill();
  const audioCtxRef = useRef<AudioContext | undefined>(undefined);
  const sourceRef = useRef<MediaStreamAudioSourceNode | undefined>(undefined);
  const streamRef = useRef<MediaStream | undefined>(undefined);
  const voiceConfiguration = useCapabilities(caps => caps.voiceConfiguration);
  const workletRef = useRef<AudioWorkletNode | undefined>(undefined);

  const chunkIntervalMs = voiceConfiguration?.chunkIntervalMs ?? DEFAULT_CHUNK_SIZE_IN_MS;
  const sampleRate = voiceConfiguration?.sampleRate ?? DEFAULT_SAMPLE_RATE;

  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = undefined;
    }
  }, [streamRef]);

  // Acquire MediaStream and connect source to worklet
  const acquireAndConnectMediaStream = useCallback(async () => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        sampleRate
      }
    });
    streamRef.current = stream;

    const source = audioCtx.createMediaStreamSource(stream);
    if (workletRef.current) {
      source.connect(workletRef.current);
    }
    sourceRef.current = source;
  }, [audioCtxRef, sampleRate, sourceRef, streamRef, workletRef]);

  const stopRecording = useCallback(() => {
    if (workletRef.current) {
      workletRef.current.port.postMessage({ command: 'STOP' });
      workletRef.current.disconnect();
      workletRef.current = undefined;
    }
    stopMediaStream();
  }, [stopMediaStream, workletRef]);

  const initAudio = useCallback(async () => {
    if (audioCtxRef.current) {
      return;
    }
    const audioCtx = new AudioContext({ sampleRate });
    const blob = new Blob([audioProcessorCode], {
      type: 'application/javascript'
    });
    // eslint-disable-next-line no-restricted-properties
    const url = URL.createObjectURL(blob);
    await audioCtx.audioWorklet.addModule(url);
    URL.revokeObjectURL(url);
    // eslint-disable-next-line require-atomic-updates
    audioCtxRef.current = audioCtx;
  }, [audioCtxRef, sampleRate]);

  const startRecording = useCallback(async () => {
    await initAudio();
    const audioCtx = audioCtxRef.current!; // audioCtx must be available after initAudio().
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    const worklet = new AudioWorkletNode(audioCtx, 'audio-recorder', {
      processorOptions: {
        bufferSize: (sampleRate * chunkIntervalMs) / MS_IN_SECOND
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

    worklet.connect(audioCtx.destination);
    workletRef.current = worklet;

    await acquireAndConnectMediaStream();

    worklet.port.postMessage({ command: 'START' });
  }, [
    Date,
    acquireAndConnectMediaStream,
    audioCtxRef,
    chunkIntervalMs,
    initAudio,
    onAudioChunk,
    sampleRate,
    workletRef
  ]);

  const muteRecording = useCallback(() => {
    // Stop MediaStream (mic indicator OFF) and disconnect source
    stopMediaStream();

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = undefined;
    }

    // Tell worklet to output silence
    if (workletRef.current) {
      workletRef.current.port.postMessage({ command: 'MUTE' });
    }

    // Return unmute function
    return () => {
      if (!audioCtxRef.current || !workletRef.current) {
        return;
      }

      // Tell worklet to use real audio
      workletRef.current.port.postMessage({ command: 'UNMUTE' });

      // Restart MediaStream and reconnect source (fire and forget)
      acquireAndConnectMediaStream();
    };
  }, [acquireAndConnectMediaStream, audioCtxRef, sourceRef, stopMediaStream, workletRef]);

  const record = useCallback(() => {
    startRecording();
    return stopRecording;
  }, [startRecording, stopRecording]);

  const mute = useCallback(() => muteRecording(), [muteRecording]);

  return useMemo(() => ({ record, mute }), [record, mute]);
}
