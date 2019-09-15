import { useSelector } from '../WebChatReduxContext';

export default function useReadyState() {
  return [
    useSelector(({ readyState }) => readyState),
    () => {
      throw new Error('ReadyState cannot be set.');
    }
  ];
}
