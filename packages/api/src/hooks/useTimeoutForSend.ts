import DirectLineActivity from '../types/external/DirectLineActivity';
import useStyleOptions from './useStyleOptions';

export default function useTimeoutForSend(): [number | ((activity: DirectLineActivity) => number)] {
  const [{ sendTimeout }] = useStyleOptions();

  return [sendTimeout];
}
