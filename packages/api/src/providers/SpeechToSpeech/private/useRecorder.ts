import { useRef, useState, useCallback } from 'react';

const audioProcessorCode = `
class AudioRecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.recording = false
    this.buffer = []
    this.port.onmessage = e => {
      if (e.data.command === 'START') this.recording = true
      else if (e.data.command === 'STOP') {
        this.recording = false
        if (this.buffer.length) this.sendBuffer()
      }
    }
  }
  sendBuffer() {
    if (this.buffer.length) {
      this.port.postMessage({
        eventType: 'audio',
        audioData: new Float32Array(this.buffer)
      })
      this.buffer = []
    }
  }
  process(inputs) {
    if (inputs[0]?.length && this.recording) {
      this.buffer.push(...inputs[0][0])
      if (this.buffer.length >= 2400) this.sendBuffer()
    }
    return true
  }
}
registerProcessor('audio-recorder', AudioRecorderProcessor)
`;

const INT16_MIN = -32768;
const INT16_MAX = 32767;
const INT16_SCALE = 32767;

export function useRecorder(onAudioChunk: (base64: string) => void) {
  const [recording, setRecordingInternal] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const initAudio = useCallback(async () => {
    if (audioCtxRef.current) {
      return;
    }
    const audioCtx = new AudioContext({ sampleRate: 24000 });
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
        sampleRate: 24000,
        echoCancellation: true
      }
    });
    streamRef.current = stream;
    const source = audioCtx.createMediaStreamSource(stream);
    const worklet = new AudioWorkletNode(audioCtx, 'audio-recorder');

    worklet.port.onmessage = e => {
      if (e.data.eventType === 'audio') {
        const float32 = e.data.audioData;
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
          // eslint-disable-next-line security/detect-object-injection
          int16[i] = Math.max(INT16_MIN, Math.min(INT16_MAX, float32[i] * INT16_SCALE));
        }
        const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
        onAudioChunk(base64);
      }
    };

    source.connect(worklet);
    worklet.connect(audioCtx.destination);
    worklet.port.postMessage({ command: 'START' });
    workletRef.current = worklet;
    setRecordingInternal(true);
  }, [initAudio, onAudioChunk]);

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
    setRecordingInternal(false);
  }, []);

  const setRecording = useCallback(
    async (shouldRecord: boolean) => {
      if (!shouldRecord && recording) {
        stopRecording();
      } else if (shouldRecord && !recording) {
        await startRecording();
      }
    },
    [recording, startRecording, stopRecording]
  );

  return {
    recording,
    setRecording
  };
}
