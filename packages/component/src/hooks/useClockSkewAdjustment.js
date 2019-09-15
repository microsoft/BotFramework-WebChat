import { useSelector } from '../WebChatReduxContext';

export default function useClockSkewAdjustment() {
  return [
    useSelector(({ clockSkewAdjustment }) => clockSkewAdjustment),
    () => {
      throw new Error('ClockSkewAdjustment cannot be set.');
    }
  ];
}
