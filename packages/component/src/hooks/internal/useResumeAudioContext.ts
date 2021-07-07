import useWebSpeechPonyfill from '../useWebSpeechPonyfill';

export default function useResumeAudioContext(): () => Promise<void> {
  const [{ resumeAudioContext }] = useWebSpeechPonyfill();

  return () => resumeAudioContext && resumeAudioContext();
}
