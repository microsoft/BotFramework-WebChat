import useSelector from './useSelector';

export default function useClockSkewAdjustment() {
  return useSelector(({ clockSkewAdjustment }) => clockSkewAdjustment);
}
