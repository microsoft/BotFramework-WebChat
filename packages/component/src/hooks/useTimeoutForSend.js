import useStyleOptions from './useStyleOptions';

export default function useTimeoutForSend() {
  const [{ sendTimeout }] = useStyleOptions();

  return [sendTimeout];
}
