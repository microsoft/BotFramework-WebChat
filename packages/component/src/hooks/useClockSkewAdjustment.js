import { useSelector } from '../WebChatReduxContext';

export default function useClockSkewAdjustment() {
  return useSelector(({ clockSkewAdjustment }) => clockSkewAdjustment);
}
