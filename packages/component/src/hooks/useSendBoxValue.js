import { useSelector } from '../WebChatReduxContext';

export default function useSendBoxValue() {
  return useSelector(({ sendBoxValue }) => sendBoxValue);
}
