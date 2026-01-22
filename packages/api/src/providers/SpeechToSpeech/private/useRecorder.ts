import { useRef, useCallback, useMemo } from 'react';
import usePonyfill from '../../Ponyfill/usePonyfill';

/**
 * AudioWorklet processor code for recording audio.
 * This code runs in a separate AudioWorklet context with its own globals
 * (AudioWorkletProcessor, registerProcessor, etc.)
 *
 * IMPORTANT: This must be a plain string template to avoid transpiling issues
 * as those don't exist in the AudioWorklet context.
 *
 * CSP Compliant: check __tests__/html2/speechToSpeech/csp.recording.html for CSP compliance tests.
 */
const audioProcessorCode = `
  class AudioRecorderProcessor extends AudioWorkletProcessor {
    constructor(options) {
      super()
      this.recording = false
      this.buffer = []
      this.bufferSize = options.processorOptions.bufferSize
      this.port.onmessage = e => {
        if (e.data.command === 'START') this.recording = true
        else if (e.data.command === 'STOP') {
          this.recording = false
          this.buffer = []
        }
      }
    }
    sendBuffer() {
      while (this.buffer.length >= this.bufferSize) {
        const chunk = this.buffer.splice(0, this.bufferSize)
        this.port.postMessage({
          eventType: 'audio',
          audioData: new Float32Array(chunk)
        })
      }
    }
    process(inputs) {
      if (inputs[0]?.length && this.recording) {
        this.buffer.push(...inputs[0][0])
        if (this.buffer.length >= this.bufferSize) this.sendBuffer()
      }
      return true
    }
  }
  registerProcessor('audio-recorder', AudioRecorderProcessor)`;

const INT16_MIN = -32768;
const INT16_MAX = 32767;
const INT16_SCALE = 32767;
const DEFAULT_SAMPLE_RATE = 24000;
const DEFAULT_CHUNK_SIZE_IN_MS = 100;
const MS_IN_SECOND = 1000;

export function useRecorder(onAudioChunk: (base64: string, timestamp: string) => void) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [{ Date }] = usePonyfill();

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
          // eslint-disable-next-line security/detect-object-injection
          int16[i] = Math.max(INT16_MIN, Math.min(INT16_MAX, float32[i] * INT16_SCALE));
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

  const stopRecording = useCallback(() => {
    if (workletRef.current) {
      workletRef.current.port.postMessage({ command: 'STOP' });
      workletRef.current.disconnect();
      workletRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  return useMemo(
    () => ({
      startRecording,
      stopRecording
    }),
    [startRecording, stopRecording]
  );
}
