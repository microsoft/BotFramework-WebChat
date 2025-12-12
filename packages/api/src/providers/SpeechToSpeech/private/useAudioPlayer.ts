import { useRef, useCallback } from 'react';

const SAMPLE_RATE = 24000;
const INT16_SCALE = 32768;

export function useAudioPlayer() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef(0);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext({ sampleRate: SAMPLE_RATE });
    }
    return audioCtxRef.current;
  }, []);

  const playAudio = useCallback(
    (base64: string) => {
      const audioCtx = initAudio();
      audioCtx.resume?.();

      try {
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const int16 = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(int16.length);

        for (let i = 0; i < int16.length; i++) {
          // eslint-disable-next-line security/detect-object-injection
          float32[i] = int16[i] / INT16_SCALE;
        }

        const buffer = audioCtx.createBuffer(1, float32.length, SAMPLE_RATE);
        buffer.getChannelData(0).set(float32);

        const src = audioCtx.createBufferSource();
        src.buffer = buffer;
        src.connect(audioCtx.destination);

        // Clear buffer when finished
        src.onended = () => {
          src.disconnect();
          src.buffer = null;
        };

        nextPlayTimeRef.current = Math.max(nextPlayTimeRef.current, audioCtx.currentTime);
        src.start(nextPlayTimeRef.current);
        nextPlayTimeRef.current += buffer.duration;
      } catch (error) {
        console.warn('botframework-webchat: Error during audio playback in useAudioPlayer:', error);
      }
    },
    [initAudio]
  );

  const stopAudio = useCallback(() => {
    nextPlayTimeRef.current = 0;

    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  }, []);

  return {
    playAudio,
    stopAudio,
    isPlaying: audioCtxRef.current ? audioCtxRef.current.currentTime < nextPlayTimeRef.current : false
  };
}
