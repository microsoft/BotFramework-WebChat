import { useRef, useCallback, useMemo } from 'react';
import useCapabilities from '../../Capabilities/useCapabilities';
import useVoiceStateWritable from '../../../hooks/internal/useVoiceStateWritable';

const DEFAULT_SAMPLE_RATE = 24000;
const INT16_SCALE = 32768;

export function useAudioPlayer() {
  const audioCtxRef = useRef<AudioContext | undefined>(undefined);
  const lastSourceRef = useRef<AudioBufferSourceNode | undefined>(undefined);
  const nextPlayTimeRef = useRef(0);
  const voiceConfiguration = useCapabilities(caps => caps.voiceConfiguration);
  const [, setVoiceState] = useVoiceStateWritable();

  const sampleRate = voiceConfiguration?.sampleRate ?? DEFAULT_SAMPLE_RATE;

  const queueAudio = useCallback(
    async (base64: string) => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext({ sampleRate });
      }
      const audioCtx = audioCtxRef.current;
      await audioCtx.resume();

      try {
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const int16Bytes = new Int16Array(bytes.buffer);
        const float32Bytes = new Float32Array(int16Bytes.length);

        for (let i = 0; i < int16Bytes.length; i++) {
          float32Bytes[+i] = int16Bytes.at(i) / INT16_SCALE;
        }

        const buffer = audioCtx.createBuffer(1, float32Bytes.length, audioCtx.sampleRate);
        buffer.getChannelData(0).set(float32Bytes);

        const src = audioCtx.createBufferSource();
        src.buffer = buffer;
        src.connect(audioCtx.destination);

        // Clear previous source's onended to avoid stale callbacks
        if (lastSourceRef.current) {
          lastSourceRef.current.onended = null;
        }

        src.onended = () => {
          src.disconnect();
          src.buffer = null;
          // Only the last source's onended should trigger state change to 'listening'
          if (lastSourceRef.current === src) {
            setVoiceState('listening');
          }
        };

        lastSourceRef.current = src;
        const isFirstChunk = nextPlayTimeRef.current <= audioCtx.currentTime;
        // Only dispatch bot_speaking on first chunk, we are resetting refs on stopAllAudio (bargein, mic off)
        if (isFirstChunk) {
          setVoiceState('bot_speaking');
        }

        nextPlayTimeRef.current = Math.max(nextPlayTimeRef.current, audioCtx.currentTime);
        src.start(nextPlayTimeRef.current);
        nextPlayTimeRef.current += buffer.duration;
      } catch (error) {
        console.warn('botframework-webchat: Error during audio playback in useAudioPlayer:', error);
      }
    },
    [setVoiceState, sampleRate]
  );

  const stopAllAudio = useCallback(() => {
    nextPlayTimeRef.current = 0;
    if (lastSourceRef.current) {
      lastSourceRef.current.onended = null;
      lastSourceRef.current = undefined;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = undefined;
    }
  }, []);

  return useMemo(
    () => Object.freeze({
      queueAudio,
      stopAllAudio
    }),
    [queueAudio, stopAllAudio]
  );
}
